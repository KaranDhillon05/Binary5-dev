import cron from 'node-cron';
import { query } from '../config/db';
import { getWeatherForCity } from '../services/weatherService';
import { getAQIForCity } from '../services/aqiService';
import { processClaimFraudAndPayout } from '../routes/claims';
import { v4 as uuidv4 } from 'uuid';

interface ZoneStatus {
  zone: string;
  city: string;
  last_checked: Date | null;
  weather_condition: string | null;
  aqi_value: number | null;
  weather_triggered: boolean;
  aqi_triggered: boolean;
  claims_created_this_run: number;
}

interface MonitorState {
  running: boolean;
  last_run: Date | null;
  next_run: Date | null;
  zones: Map<string, ZoneStatus>;
  total_claims_created: number;
  total_runs: number;
}

const state: MonitorState = {
  running: false,
  last_run: null,
  next_run: null,
  zones: new Map(),
  total_claims_created: 0,
  total_runs: 0,
};

export const triggerMonitorState = {
  getStatus(): {
    running: boolean;
    last_run: string | null;
    next_run: string | null;
    total_runs: number;
    total_claims_created: number;
    zones: ZoneStatus[];
  } {
    return {
      running: state.running,
      last_run: state.last_run?.toISOString() ?? null,
      next_run: state.next_run?.toISOString() ?? null,
      total_runs: state.total_runs,
      total_claims_created: state.total_claims_created,
      zones: Array.from(state.zones.values()),
    };
  },
};

async function getActiveZones(): Promise<Array<{ zone: string; city: string }>> {
  const result = await query<{ zone: string; city: string }>(
    `SELECT DISTINCT w.zone, w.city
     FROM workers w
     JOIN policies p ON p.worker_id = w.id
     WHERE p.status = 'active' AND p.coverage_end >= CURRENT_DATE`
  );
  return result.rows;
}

async function processZone(zone: string, city: string): Promise<number> {
  let claimsCreated = 0;

  const [weather, aqi] = await Promise.all([
    getWeatherForCity(city, zone),
    getAQIForCity(city, zone),
  ]);

  const weatherTriggered =
    weather.condition === 'red_alert' ||
    weather.condition === 'heavy_rain' ||
    (weather.condition === 'moderate_rain' && weather.rainfall_mm > 10);

  const aqiTriggered = aqi.aqi > 300;

  // Update zone status in memory
  state.zones.set(`${city}:${zone}`, {
    zone,
    city,
    last_checked: new Date(),
    weather_condition: weather.condition,
    aqi_value: aqi.aqi,
    weather_triggered: weatherTriggered,
    aqi_triggered: aqiTriggered,
    claims_created_this_run: 0,
  });

  if (!weatherTriggered && !aqiTriggered) return 0;

  // Get all workers in this zone with active policies
  const workersResult = await query<{ worker_id: string; policy_id: string }>(
    `SELECT w.id as worker_id, p.id as policy_id
     FROM workers w
     JOIN policies p ON p.worker_id = w.id
     WHERE w.zone = $1 AND p.status = 'active'
       AND p.coverage_end >= CURRENT_DATE`,
    [zone]
  );

  if (workersResult.rows.length === 0) return 0;

  for (const row of workersResult.rows) {
    // Avoid duplicate claims for the same trigger within the last hour
    const oneHourAgo = new Date(Date.now() - 3600000);

    if (weatherTriggered) {
      const existing = await query<{ count: string }>(
        `SELECT COUNT(*) as count FROM claims
         WHERE worker_id = $1 AND trigger_type = 'weather'
           AND created_at > $2`,
        [row.worker_id, oneHourAgo.toISOString()]
      );
      if (parseInt(existing.rows[0]?.count ?? '0', 10) === 0) {
        const claimId = uuidv4();
        await query(
          `INSERT INTO claims (id, policy_id, worker_id, trigger_type, trigger_details, status)
           VALUES ($1,$2,$3,'weather',$4,'pending')`,
          [
            claimId, row.policy_id, row.worker_id,
            JSON.stringify({
              condition: weather.condition,
              rainfall_mm: weather.rainfall_mm,
              alert_level: weather.alert_level,
              description: weather.description,
              city,
              zone,
            }),
          ]
        );
        processClaimFraudAndPayout(claimId).catch((err: Error) =>
          console.error('[TriggerMonitor] Claim fraud/payout error:', err)
        );
        claimsCreated++;
      }
    }

    if (aqiTriggered) {
      const existing = await query<{ count: string }>(
        `SELECT COUNT(*) as count FROM claims
         WHERE worker_id = $1 AND trigger_type = 'pollution'
           AND created_at > $2`,
        [row.worker_id, oneHourAgo.toISOString()]
      );
      if (parseInt(existing.rows[0]?.count ?? '0', 10) === 0) {
        const claimId = uuidv4();
        await query(
          `INSERT INTO claims (id, policy_id, worker_id, trigger_type, trigger_details, status)
           VALUES ($1,$2,$3,'pollution',$4,'pending')`,
          [
            claimId, row.policy_id, row.worker_id,
            JSON.stringify({
              aqi: aqi.aqi,
              category: aqi.category,
              heat_composite: aqi.heat_composite,
              temperature: aqi.temperature,
              city,
              zone,
            }),
          ]
        );
        processClaimFraudAndPayout(claimId).catch((err: Error) =>
          console.error('[TriggerMonitor] Claim fraud/payout error:', err)
        );
        claimsCreated++;
      }
    }
  }

  const zoneKey = `${city}:${zone}`;
  const zoneState = state.zones.get(zoneKey);
  if (zoneState) {
    zoneState.claims_created_this_run = claimsCreated;
  }

  return claimsCreated;
}

async function runMonitorCycle(): Promise<void> {
  if (state.running) {
    console.log('[TriggerMonitor] Previous cycle still running, skipping');
    return;
  }

  state.running = true;
  state.total_runs++;
  const cycleStart = Date.now();

  try {
    const zones = await getActiveZones();
    if (zones.length === 0) {
      console.log('[TriggerMonitor] No active zones to monitor');
      return;
    }

    console.log(`[TriggerMonitor] Checking ${zones.length} active zone(s)`);

    let totalClaims = 0;
    for (const { zone, city } of zones) {
      try {
        const claims = await processZone(zone, city);
        totalClaims += claims;
      } catch (err) {
        console.error(`[TriggerMonitor] Error processing zone ${zone}/${city}:`, err);
      }
    }

    state.total_claims_created += totalClaims;
    const duration = Date.now() - cycleStart;

    if (totalClaims > 0) {
      console.log(`[TriggerMonitor] Cycle complete — ${totalClaims} claims created in ${duration}ms`);
    }
  } catch (err) {
    console.error('[TriggerMonitor] Cycle error:', err);
  } finally {
    state.running = false;
    state.last_run = new Date();
    state.next_run = new Date(Date.now() + 5 * 60 * 1000);
  }
}

let cronTask: cron.ScheduledTask | null = null;

export function startTriggerMonitor(): void {
  if (cronTask) return;

  console.log('[TriggerMonitor] Starting — polling every 5 minutes');
  state.next_run = new Date(Date.now() + 5 * 60 * 1000);

  cronTask = cron.schedule('*/5 * * * *', () => {
    runMonitorCycle().catch((err) => console.error('[TriggerMonitor] Unhandled error:', err));
  });

  // Run an initial cycle after a short delay to let the DB settle
  setTimeout(() => {
    runMonitorCycle().catch((err) => console.error('[TriggerMonitor] Initial cycle error:', err));
  }, 10000);
}

export function stopTriggerMonitor(): void {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
    console.log('[TriggerMonitor] Stopped');
  }
}

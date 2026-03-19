import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  timeout: 10000,
});

export interface Worker {
  id: string;
  name: string;
  phone: string;
  platform: string;
  city: string;
  zone: string;
  deliveryHoursPerDay: number;
}

export interface Policy {
  id: string;
  tier: string;
  basePremium: number;
  adjustedPremium: number;
  maxWeeklyPayout: number;
  coverageEnd: string;
  status: string;
}

export interface Claim {
  id: string;
  type: string;
  amount: number;
  status: string;
  date: string;
  fraudScore?: number;
  description?: string;
  zone?: string;
}

export interface WorkerRegistrationData {
  name: string;
  phone: string;
  platform: string;
  city: string;
  zone: string;
  deliveryHoursPerDay: number;
}

export interface ClaimData {
  workerId: string;
  type: string;
  amount: number;
  description: string;
  zone: string;
}

export const MOCK_WORKER: Worker = {
  id: "worker-001",
  name: "Arjun Kumar",
  phone: "+91 98765 43210",
  platform: "zepto",
  city: "Bengaluru",
  zone: "Koramangala",
  deliveryHoursPerDay: 9,
};

export const MOCK_POLICY: Policy = {
  id: "pol-001",
  tier: "standard",
  basePremium: 65,
  adjustedPremium: 82,
  maxWeeklyPayout: 1000,
  coverageEnd: "2026-03-24",
  status: "active",
};

export const MOCK_CLAIMS: Claim[] = [
  { id: "clm-001", type: "weather", amount: 167, status: "auto_approved", date: "2026-03-15", fraudScore: 0.12, zone: "Koramangala" },
  { id: "clm-002", type: "pollution", amount: 83, status: "fast_verify", date: "2026-03-10", fraudScore: 0.28, zone: "Indiranagar" },
  { id: "clm-003", type: "zone_closure", amount: 133, status: "approved", date: "2026-03-05", fraudScore: 0.05, zone: "HSR Layout" },
  { id: "clm-004", type: "weather", amount: 200, status: "manual_review", date: "2026-02-28", fraudScore: 0.65, zone: "Whitefield" },
  { id: "clm-005", type: "traffic", amount: 95, status: "rejected", date: "2026-02-20", fraudScore: 0.82, zone: "Electronic City" },
];

export async function getWorkerProfile(workerId: string): Promise<Worker | null> {
  try {
    const res = await api.get(`/api/workers/${workerId}`);
    return res.data;
  } catch {
    return null;
  }
}

export async function registerWorker(data: WorkerRegistrationData): Promise<Worker | null> {
  try {
    const res = await api.post("/api/workers/register", data);
    return res.data;
  } catch {
    return null;
  }
}

export async function getZoneRisk(zone: string): Promise<{ level: string; score: number } | null> {
  try {
    const res = await api.get(`/api/risk/zone/${encodeURIComponent(zone)}`);
    return res.data;
  } catch {
    return null;
  }
}

export async function getRiskProfile(workerId: string): Promise<{ level: string; score: number } | null> {
  try {
    const res = await api.get(`/api/risk/worker/${workerId}`);
    return res.data;
  } catch {
    return null;
  }
}

export async function createPolicy(workerId: string, tier: string): Promise<Policy | null> {
  try {
    const res = await api.post("/api/policies", { workerId, tier });
    return res.data;
  } catch {
    return null;
  }
}

export async function getPolicies(workerId: string): Promise<Policy[] | null> {
  try {
    const res = await api.get(`/api/policies?workerId=${workerId}`);
    return res.data.data || res.data;
  } catch {
    return null;
  }
}

export async function createClaim(data: ClaimData): Promise<Claim | null> {
  try {
    const res = await api.post("/api/claims", data);
    return res.data.data || res.data;
  } catch {
    return null;
  }
}

export async function getClaims(workerId?: string): Promise<Claim[] | null> {
  try {
    const url = workerId ? `/api/claims?workerId=${workerId}` : "/api/claims";
    const res = await api.get(url);
    return res.data.data || res.data;
  } catch {
    return null;
  }
}

export async function getClaimById(claimId: string): Promise<Claim | null> {
  try {
    const res = await api.get(`/api/claims/${claimId}`);
    return res.data.data || res.data;
  } catch {
    return null;
  }
}

export async function getAdminStats(): Promise<Record<string, unknown> | null> {
  try {
    const res = await api.get("/api/admin/stats");
    return res.data;
  } catch {
    return null;
  }
}

export async function getAdminClaims(): Promise<Claim[] | null> {
  try {
    const res = await api.get("/api/admin/claims");
    return res.data;
  } catch {
    return null;
  }
}

import axios from 'axios';
import { env } from '../config/env';

export interface AQIData {
  city: string;
  zone: string;
  aqi: number;
  category: 'good' | 'moderate' | 'unhealthy_sensitive' | 'unhealthy' | 'very_unhealthy' | 'hazardous';
  temperature: number | null;
  heat_composite: boolean;
  pollutants: Record<string, number>;
  timestamp: Date;
}

interface OpenAQMeasurement {
  parameter: string;
  value: number;
  unit: string;
}

interface OpenAQLocation {
  results: Array<{
    measurements: OpenAQMeasurement[];
  }>;
}

function aqiCategory(aqi: number): AQIData['category'] {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'unhealthy_sensitive';
  if (aqi <= 200) return 'unhealthy';
  if (aqi <= 300) return 'very_unhealthy';
  return 'hazardous';
}

function mockAQIData(city: string, zone: string): AQIData {
  const rand = Math.random();
  let aqi: number;

  if (rand < 0.03) {
    aqi = 301 + Math.floor(Math.random() * 200);
  } else if (rand < 0.1) {
    aqi = 201 + Math.floor(Math.random() * 99);
  } else if (rand < 0.3) {
    aqi = 101 + Math.floor(Math.random() * 99);
  } else {
    aqi = 50 + Math.floor(Math.random() * 50);
  }

  const temperature = 25 + Math.random() * 15;
  const heat_composite = aqi > 200 && temperature > 35;

  return {
    city,
    zone,
    aqi,
    category: aqiCategory(aqi),
    temperature: parseFloat(temperature.toFixed(1)),
    heat_composite,
    pollutants: {
      pm25: parseFloat((aqi * 0.4 + Math.random() * 20).toFixed(1)),
      pm10: parseFloat((aqi * 0.6 + Math.random() * 30).toFixed(1)),
      no2: parseFloat((10 + Math.random() * 50).toFixed(1)),
    },
    timestamp: new Date(),
  };
}

export async function getAQIForCity(city: string, zone: string): Promise<AQIData> {
  if (env.USE_MOCK_SERVICES) {
    return mockAQIData(city, zone);
  }

  try {
    const response = await axios.get<OpenAQLocation>(
      `${env.OPENAQ_BASE_URL}/locations`,
      {
        params: {
          city,
          limit: 1,
          parameter: 'pm25',
        },
        timeout: 5000,
      }
    );

    const location = response.data.results[0];
    if (!location) return mockAQIData(city, zone);

    const pollutants: Record<string, number> = {};
    let pm25 = 0;

    for (const m of location.measurements) {
      pollutants[m.parameter] = m.value;
      if (m.parameter === 'pm25') pm25 = m.value;
    }

    // Rough AQI conversion from PM2.5 concentration
    const aqi = Math.min(500, Math.round((pm25 / 0.4) * 1.1));
    const heat_composite = aqi > 200;

    return {
      city,
      zone,
      aqi,
      category: aqiCategory(aqi),
      temperature: null,
      heat_composite,
      pollutants,
      timestamp: new Date(),
    };
  } catch (err) {
    console.warn('[AQIService] API call failed, using mock data:', err);
    return mockAQIData(city, zone);
  }
}

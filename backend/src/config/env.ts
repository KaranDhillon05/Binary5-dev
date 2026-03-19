import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  DATABASE_URL: string;
  ML_SERVICE_URL: string;
  OPENWEATHER_API_KEY: string;
  OPENWEATHER_BASE_URL: string;
  OPENAQ_BASE_URL: string;
  USE_MOCK_SERVICES: boolean;
  CORS_ORIGIN: string;
}

function requireEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env: EnvConfig = {
  // Backend API default port. Frontend (Next.js) defaults to :3000; run backend on :3001.
  PORT: parseInt(process.env['PORT'] ?? '3001', 10),
  NODE_ENV: process.env['NODE_ENV'] ?? 'development',
  DATABASE_URL: requireEnv('DATABASE_URL', 'postgresql://postgres:password@localhost:5432/qshield'),
  ML_SERVICE_URL: process.env['ML_SERVICE_URL'] ?? 'http://localhost:8000',
  OPENWEATHER_API_KEY: process.env['OPENWEATHER_API_KEY'] ?? '',
  OPENWEATHER_BASE_URL: process.env['OPENWEATHER_BASE_URL'] ?? 'https://api.openweathermap.org/data/2.5',
  OPENAQ_BASE_URL: process.env['OPENAQ_BASE_URL'] ?? 'https://api.openaq.org/v2',
  USE_MOCK_SERVICES: process.env['USE_MOCK_SERVICES'] === 'true',
  // Frontend (Next.js) runs on :3000; backend API runs on :3001 by default.
  // Override CORS_ORIGIN when deploying (e.g. CORS_ORIGIN=https://qshield.vercel.app).
  CORS_ORIGIN: process.env['CORS_ORIGIN'] ?? 'http://localhost:3000',
};

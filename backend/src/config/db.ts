import { Pool, PoolClient } from 'pg';
import { env } from './env';

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<{ rows: T[]; rowCount: number | null }> {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;

  if (env.NODE_ENV === 'development') {
    console.debug(`[DB] query: ${text.slice(0, 80)}... | duration: ${duration}ms | rows: ${result.rowCount}`);
  }

  return result;
}

export async function testConnection(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    console.log('[DB] PostgreSQL connection established');
  } finally {
    client.release();
  }
}

export default pool;

import pg from 'pg';
const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://qr_user:password@postgres:5432/qr_platform'
});

export default pool;

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://qr_user:password@postgres:5432/qr_platform'
});

module.exports = pool;

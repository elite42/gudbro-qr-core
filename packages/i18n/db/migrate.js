const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrate() {
  try {
    console.log('[Migrate] Reading schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('[Migrate] Executing migration...');
    await pool.query(schema);

    console.log('[Migrate] ✅ Migration completed');
    process.exit(0);
  } catch (error) {
    console.error('[Migrate] ❌ Error:', error);
    process.exit(1);
  }
}

migrate();

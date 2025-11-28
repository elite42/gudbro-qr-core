const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function migrate() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🚀 Starting database migration...');
    
    // Read and execute schema
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, 'schema.sql'),
      'utf8'
    );
    
    await pool.query(schemaSQL);
    
    console.log('✅ Database migration completed successfully!');
    console.log('📊 Tables created:');
    console.log('   - users');
    console.log('   - qr_codes');
    console.log('   - qr_scans');
    console.log('👤 Demo user created: demo@qrplatform.com (password: test123)');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();

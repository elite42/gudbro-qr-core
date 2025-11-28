// Database Migration Script
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function migrate() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('Starting migration...');
    
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema
    await pool.query(schema);

    console.log('✅ Migration completed successfully!');
    console.log('Tables created:');
    console.log('  - shared_menu_items');
    console.log('  - menu_item_modifiers');
    console.log('  - restaurant_menu_items');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

migrate().catch(console.error);

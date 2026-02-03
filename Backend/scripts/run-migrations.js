const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Read environment variables
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'security_nestjs',
});

async function runMigrations() {
  try {
    const migrationPath = path.join(__dirname, '../src/config/migrations.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('Running database migrations...');
    await pool.query(migrationSQL);
    console.log('✓ Migrations completed successfully');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    await pool.end();
    process.exit(1);
  }
}

runMigrations();

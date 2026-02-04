//Security-nestjs\Backend\backend\src\config\database.config.ts

import { Pool } from 'pg';
import { mockPool } from './mock-database';

let pool: any;

try {
  // Try to connect to PostgreSQL
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'otp_login_db',
  });

  // Test connection
  pool.query('SELECT NOW()').then(() => {
    console.log('✓ Connected to PostgreSQL database');
  }).catch((err: any) => {
    console.warn('⚠ PostgreSQL connection failed, using mock database:', err.message);
    pool = mockPool;
  });
} catch (error) {
  console.warn('⚠ Using mock database for development/testing');
  pool = mockPool;
}

export { pool };

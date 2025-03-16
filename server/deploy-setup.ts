import { drizzle } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import * as schema from '@db/schema';
import ws from "ws";
import path from "path";
import fs from "fs";
import pkg from 'pg';
const { Pool } = pkg;

export async function setupDeployment() {
  try {
    console.log('Starting deployment setup...');

    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?",
      );
    }

    console.log('Checking DATABASE_URL format...');
    const dbUrl = new URL(process.env.DATABASE_URL);
    console.log('Database host:', dbUrl.hostname);
    console.log('Database name:', dbUrl.pathname.slice(1));

    // Verify migration folder exists
    const migrationPath = path.join(process.cwd(), 'drizzle');
    console.log('Checking migrations folder:', migrationPath);
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration folder not found at ${migrationPath}`);
    }

    // List migration files
    const files = fs.readdirSync(migrationPath);
    console.log('Found migration files:', files);

    if (files.length === 0) {
      throw new Error('No migration files found in the drizzle folder');
    }

    console.log('Initializing database connection...');
    neonConfig.webSocketConstructor = ws;
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set');
    }
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql, { schema });

    // First verify we can connect to the database
    try {
      const result = await pool.query('SELECT current_database()'); // Changed query method
      console.log('Connected to database:', result.rows[0].current_database);
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }

    // Verify database schema before running migrations
    try {
      const tables = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `); // Changed query method
      console.log('Existing tables:', tables.rows.map(t => t.table_name));
    } catch (error) {
      console.error('Failed to check existing tables:', error);
      throw error;
    }

    console.log('Running database migrations...');
    try {
      await migrate(db, { 
        migrationsFolder: migrationPath,
        migrationsTable: 'drizzle_migrations'
      });
      console.log('Database migrations completed successfully');
    } catch (migrationError: any) {
      console.error('Migration error details:', migrationError);
      throw new Error(`Failed to run migrations: ${migrationError.message}`);
    }

    // Verify schema after migrations
    try {
      const tables = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `); // Changed query method

      const requiredTables = [
        'blog_posts', 'learning_path_progress', 'learning_paths',
        'messages', 'progress_analytics', 'quiz_progress',
        'quiz_questions', 'roles', 'sessions', 'subject_history', 'users'
      ];

      console.log('Verifying required tables...');
      const missingTables = requiredTables.filter(
        required => !tables.rows.find(t => t.table_name === required)
      );

      if (missingTables.length > 0) {
        throw new Error(`Missing required tables: ${missingTables.join(', ')}`);
      }

      console.log('All required tables are present');
    } catch (error) {
      console.error('Failed to verify tables after migration:', error);
      throw error;
    }

    console.log('Deployment setup completed successfully');
    return true;
  } catch (error) {
    console.error('Deployment setup failed:', error);
    throw error;
  }
}
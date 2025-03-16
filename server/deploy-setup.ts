import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon, neonConfig } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import * as schema from '@db/schema';
import ws from "ws";
import path from "path";
import fs from "fs";

export async function setupDeployment() {
  try {
    console.log('Starting deployment setup...');

    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?",
      );
    }

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
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql, { schema });

    console.log('Running database migrations...');
    try {
      await migrate(db, { 
        migrationsFolder: './drizzle',
        migrationsTable: 'drizzle_migrations'
      });
      console.log('Database migrations completed successfully');
    } catch (migrationError) {
      console.error('Migration error details:', migrationError);
      throw new Error(`Failed to run migrations: ${migrationError.message}`);
    }

    return true;
  } catch (error) {
    console.error('Deployment setup failed:', error);
    throw error;
  }
}
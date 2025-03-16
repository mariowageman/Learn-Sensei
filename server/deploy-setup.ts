import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import * as schema from '@db/schema';
import ws from 'ws';

export async function setupDeployment() {
  try {
    console.log('Starting deployment setup...');

    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Configure WebSocket for Neon
    const sql = neon(process.env.DATABASE_URL, {
      webSocketConstructor: ws
    });

    console.log('Initializing database connection...');
    const db = drizzle(sql, { schema });

    console.log('Running database migrations...');
    await migrate(db, { 
      migrationsFolder: './drizzle',
      migrationsTable: 'drizzle_migrations'
    });

    console.log('Database migrations completed successfully');
    return true;
  } catch (error) {
    console.error('Deployment setup failed:', error);
    throw error;
  }
}
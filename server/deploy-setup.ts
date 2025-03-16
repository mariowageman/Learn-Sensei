import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import * as schema from '@db/schema';

export async function setupDeployment() {
  try {
    console.log('Starting deployment setup...');
    
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql, { schema });
    
    console.log('Running database migrations...');
    await migrate(db, { migrationsFolder: './drizzle' });
    
    console.log('Database migrations completed successfully');
    return true;
  } catch (error) {
    console.error('Deployment setup failed:', error);
    throw error;
  }
}

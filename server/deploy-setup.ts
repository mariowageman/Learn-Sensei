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
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql, { schema });

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

    // Verify database connection and schema after migration
    try {
      // First check for all required tables
      const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `;

      const requiredTables = [
        'blog_posts', 'learning_path_progress', 'learning_paths',
        'messages', 'progress_analytics', 'quiz_progress',
        'quiz_questions', 'roles', 'sessions', 'subject_history', 'users'
      ];

      console.log('Verifying required tables...');
      const missingTables = requiredTables.filter(
        required => !tables.find(t => t.table_name === required)
      );

      if (missingTables.length > 0) {
        throw new Error(`Missing required tables: ${missingTables.join(', ')}`);
      }

      // Then verify table schemas
      const result = await sql`
        SELECT table_name, column_name, data_type, column_default, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position;
      `;

      console.log('Database schema verification:');
      const tableColumns = result.reduce((acc: any, row: any) => {
        if (!acc[row.table_name]) {
          acc[row.table_name] = [];
        }
        acc[row.table_name].push({
          name: row.column_name,
          type: row.data_type,
          nullable: row.is_nullable === 'YES',
          default: row.column_default
        });
        return acc;
      }, {});

      // Log schema details
      Object.entries(tableColumns).forEach(([table, columns]) => {
        console.log(`\nTable ${table}:`);
        (columns as any[]).forEach(col => {
          console.log(`  - ${col.name} (${col.type})${col.nullable ? ' NULL' : ' NOT NULL'}${col.default ? ` DEFAULT ${col.default}` : ''}`);
        });
      });

      // Verify foreign key constraints
      const constraints = await sql`
        SELECT 
          con.conname AS constraint_name,
          con.conrelid::regclass AS table_name,
          con.confrelid::regclass AS foreign_table_name
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = con.connamespace
        WHERE con.contype = 'f'
        AND nsp.nspname = 'public';
      `;

      console.log('\nForeign key constraints:');
      constraints.forEach((constraint: any) => {
        console.log(`  - ${constraint.constraint_name}: ${constraint.table_name} -> ${constraint.foreign_table_name}`);
      });

    } catch (dbError: any) {
      console.error('Database verification error:', dbError);
      throw new Error(`Failed to verify database schema: ${dbError.message}`);
    }

    console.log('Deployment setup completed successfully');
    return true;
  } catch (error) {
    console.error('Deployment setup failed:', error);
    throw error;
  }
}
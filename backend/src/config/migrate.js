import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { ensureDatabaseExists } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations() {
  console.log('[Migration] Ensuring MySQL database exists...');
  await ensureDatabaseExists();

  console.log('[Migration] Applying MySQL database schema...');
  const schemaFile = path.resolve(__dirname, '../../../database/schema/schema.sql');
  if (!fs.existsSync(schemaFile)) {
    throw new Error(`Schema file not found at: ${schemaFile}`);
  }

  const sql = fs.readFileSync(schemaFile, 'utf8');
  await db.query(sql);
  console.log('[Migration] MySQL schema applied successfully.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations()
    .then(() => {
      console.log('[Migration] Done.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Migration] Failed to apply schema:', err.message);
      process.exit(1);
    });
}

export default runMigrations;

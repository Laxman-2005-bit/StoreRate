import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';
import { runMigrations } from './migrate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runSeeds() {
  console.log('[Seed] Ensuring MySQL schema exists...');
  await runMigrations();

  console.log('[Seed] Populating MySQL seed data...');
  const seedFile = path.resolve(__dirname, '../../../database/seeds/seed.sql');
  if (!fs.existsSync(seedFile)) {
    throw new Error(`Seed file not found at: ${seedFile}`);
  }

  const sql = fs.readFileSync(seedFile, 'utf8');
  await db.query(sql);

  console.log('[Seed] MySQL database seeded successfully!');
  console.log('----------------------------------------------------');
  console.log('DEMO CREDENTIALS FOR EVALUATION:');
  console.log('System Admin: admin@storerating.com / Admin@123');
  console.log('Normal User:  user1@example.com     / User@1234');
  console.log('Normal User:  user2@example.com     / User@1234');
  console.log('Store Owner:  owner1@example.com    / Owner@1234');
  console.log('Store Owner:  owner2@example.com    / Owner@1234');
  console.log('Store Owner:  owner3@example.com    / Owner@1234');
  console.log('----------------------------------------------------');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runSeeds()
    .then(() => {
      console.log('[Seed] Done.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed] Failed to seed MySQL database:', err.message);
      process.exit(1);
    });
}

export default runSeeds;

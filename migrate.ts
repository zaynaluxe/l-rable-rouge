import pool from './src/db.ts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  console.log('Running migrations from schema.sql...');
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon to execute each statement (simple approach)
    // Note: This might fail if semicolons are inside strings or functions, 
    // but for this schema it should be fine.
    // A better way is to execute the whole block if the driver supports it.
    await pool.query(schema);
    
    console.log('Migration successful: All tables ensured.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit();
  }
}

migrate();

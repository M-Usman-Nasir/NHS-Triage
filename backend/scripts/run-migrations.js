#!/usr/bin/env node
/**
 * Applies database/migrations/*.sql in lexical order, once each (schema_migrations).
 * Usage: DATABASE_URL=postgres://... node scripts/run-migrations.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const MIGRATIONS_DIR = path.join(__dirname, '../../database/migrations');

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    // eslint-disable-next-line no-console
    console.error('DATABASE_URL is not set. Example: postgres://user:pass@localhost:5432/aegis');
    process.exit(1);
  }

  if (!fs.existsSync(MIGRATIONS_DIR)) {
    // eslint-disable-next-line no-console
    console.error('Migrations directory not found:', MIGRATIONS_DIR);
    process.exit(1);
  }

  const client = new Client({ connectionString: url });
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version         VARCHAR(255) PRIMARY KEY,
      applied_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql') && f !== 'README.md')
    .sort();

  // eslint-disable-next-line no-console
  console.log('Applying', files.length, 'migration file(s)…');

  for (const file of files) {
    const version = file;
    const applied = await client.query('SELECT 1 FROM schema_migrations WHERE version = $1', [version]);
    if (applied.rowCount > 0) {
      // eslint-disable-next-line no-console
      console.log('  skip (already applied):', file);
      continue;
    }

    const fullPath = path.join(MIGRATIONS_DIR, file);
    const sql = fs.readFileSync(fullPath, 'utf8');

    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [version]);
      await client.query('COMMIT');
      // eslint-disable-next-line no-console
      console.log('  applied:', file);
    } catch (e) {
      await client.query('ROLLBACK');
      // eslint-disable-next-line no-console
      console.error('  FAILED:', file, e.message);
      throw e;
    }
  }

  await client.end();
  // eslint-disable-next-line no-console
  console.log('Migrations complete.');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

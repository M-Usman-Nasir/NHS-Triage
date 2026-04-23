/**
 * Optional PostgreSQL pool (activated when DATABASE_URL is set).
 */

'use strict';

const { Pool } = require('pg');

/** @type {import('pg').Pool | null} */
let pool = null;

/**
 * @returns {import('pg').Pool | null}
 */
function getPool() {
  const conn = process.env.DATABASE_URL;
  if (!conn) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: conn,
      max: parseInt(process.env.PG_POOL_MAX || '10', 10),
      idleTimeoutMillis: 30_000,
    });
    pool.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error('[db] Unexpected pool error', err.message);
    });
  }
  return pool;
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = {
  getPool,
  closePool,
};

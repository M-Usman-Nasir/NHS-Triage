/**
 * Audit events: PostgreSQL when DATABASE_URL is set, else in-memory store.
 */

'use strict';

const { getPool } = require('./db');
const auditEventStore = require('../store/auditEventStore');

/**
 * @param {string | null | undefined} ip
 * @returns {string | null}
 */
function sanitiseInet(ip) {
  if (!ip || typeof ip !== 'string') return null;
  const t = ip.trim();
  if (!t || t === '::1' || t === '127.0.0.1') return t;
  // Basic guard: pg INET rejects arbitrary strings
  if (/^[\d.:a-fA-F%]+$/.test(t) && t.length <= 45) return t;
  return null;
}

/**
 * @param {object} row snake_case fields matching audit_logs + request_id
 */
async function persistAuditRow(row) {
  const pool = getPool();
  if (!pool) {
    return auditEventStore.appendEvent(row);
  }

  try {
    const payloadJson =
      row.payload === null || row.payload === undefined
        ? null
        : typeof row.payload === 'string'
          ? row.payload
          : JSON.stringify(row.payload);

    const res = await pool.query(
      `INSERT INTO audit_logs (event_type, action, entity_type, entity_id, user_id, ip_address, payload, data, request_id)
       VALUES ($1, $2, $3, $4, $5, $6::inet, $7::jsonb, $8::jsonb, $9)
       RETURNING id, created_at`,
      [
        row.event_type,
        row.event_type,
        row.entity_type,
        row.entity_id,
        row.user_id,
        sanitiseInet(row.ip_address),
        payloadJson,
        payloadJson,
        row.request_id || null,
      ],
    );
    const r = res.rows[0];
    return {
      id: r.id,
      event_type: row.event_type,
      entity_type: row.entity_type,
      entity_id: row.entity_id,
      user_id: row.user_id,
      ip_address: row.ip_address,
      payload: row.payload,
      request_id: row.request_id,
      created_at: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
      source: 'postgres',
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[auditPersistence] INSERT failed, using in-memory store:', err.message);
    return auditEventStore.appendEvent(row);
  }
}

/**
 * @param {{ eventType?: string, entityId?: string }} [filter]
 * @param {{ limit?: number, offset?: number }} [page]
 */
async function queryAuditEvents(filter = {}, page = {}) {
  const pool = getPool();
  if (!pool) {
    return auditEventStore.queryEvents(filter, page);
  }

  const limit = Math.min(Math.max(parseInt(String(page.limit || 100), 10) || 100, 1), 500);
  const offset = Math.max(parseInt(String(page.offset || 0), 10) || 0, 0);

  const cond = ['TRUE'];
  const params = [];
  let n = 1;
  if (filter.eventType) {
    cond.push(`event_type = $${n++}`);
    params.push(filter.eventType);
  }
  if (filter.entityId) {
    cond.push(`entity_id = $${n++}::uuid`);
    params.push(filter.entityId);
  }
  const where = cond.join(' AND ');

  const countRes = await pool.query(`SELECT COUNT(*)::int AS c FROM audit_logs WHERE ${where}`, params);
  const total = countRes.rows[0].c;

  const limIdx = n++;
  const offIdx = n++;
  const dataSql = `
    SELECT id, event_type, entity_type, entity_id, user_id,
           host(ip_address) AS ip_address,
           payload, request_id, created_at
    FROM audit_logs
    WHERE ${where}
    ORDER BY id DESC
    LIMIT $${limIdx} OFFSET $${offIdx}
  `;
  const dataRes = await pool.query(dataSql, [...params, limit, offset]);

  const items = dataRes.rows.map((r) => ({
    id: r.id,
    event_type: r.event_type,
    entity_type: r.entity_type,
    entity_id: r.entity_id,
    user_id: r.user_id,
    ip_address: r.ip_address,
    payload: r.payload,
    request_id: r.request_id,
    created_at: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
  }));

  return { total, items };
}

/**
 * @param {string} entityId
 */
async function auditEventsForEntity(entityId) {
  const pool = getPool();
  if (!pool) {
    return auditEventStore.eventsForEntity(entityId);
  }
  const res = await pool.query(
    `SELECT id, event_type, entity_type, entity_id, user_id,
            host(ip_address) AS ip_address,
            payload, request_id, created_at
     FROM audit_logs
     WHERE entity_id = $1::uuid
     ORDER BY id ASC`,
    [entityId],
  );
  return res.rows.map((r) => ({
    id: r.id,
    event_type: r.event_type,
    entity_type: r.entity_type,
    entity_id: r.entity_id,
    user_id: r.user_id,
    ip_address: r.ip_address,
    payload: r.payload,
    request_id: r.request_id,
    created_at: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
  }));
}

module.exports = {
  persistAuditRow,
  queryAuditEvents,
  auditEventsForEntity,
};

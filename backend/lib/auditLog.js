/**
 * Structured clinical / IG audit logging.
 * Mirrors audit_logs columns in database/schema.sql; persists to PostgreSQL when DATABASE_URL is set.
 */

'use strict';

const { persistAuditRow } = require('./auditPersistence');

/**
 * Strip obvious PII from nested objects for audit payloads (data minimisation).
 * @param {unknown} payload
 */
function sanitisePayload(payload) {
  if (payload == null || typeof payload !== 'object' || Array.isArray(payload)) {
    return payload;
  }
  const out = { ...payload };
  if (out.patient && typeof out.patient === 'object') {
    const p = { ...out.patient };
    if (p.fullName) p.fullName = '[redacted]';
    if (p.email) p.email = '[redacted]';
    if (p.phone) p.phone = '[redacted]';
    out.patient = p;
  }
  if (out.answers && typeof out.answers === 'object') {
    out.answers = { _keys: Object.keys(out.answers), _count: Object.keys(out.answers).length };
  }
  return out;
}

/**
 * @param {object} p
 * @param {string} p.eventType
 * @param {string} [p.requestId]
 * @param {string} [p.entityType]
 * @param {string} [p.entityId]
 * @param {string} [p.userId]
 * @param {string} [p.ip]
 * @param {object} [p.payload]
 * @returns {Promise<object>}
 */
async function logAuditEvent(p) {
  const row = {
    event_type: p.eventType,
    entity_type: p.entityType || null,
    entity_id: p.entityId || null,
    user_id: p.userId || null,
    ip_address: p.ip || null,
    payload: sanitisePayload(p.payload) ?? null,
    request_id: p.requestId || null,
  };

  const rec = await persistAuditRow(row);

  if (process.env.AUDIT_LOG_STDOUT === '1') {
    // eslint-disable-next-line no-console
    console.log(
      `[AUDIT] ${rec.event_type} id=${rec.id} entity=${rec.entity_type || '-'}:${rec.entity_id || '-'} req=${rec.request_id || '-'}`,
    );
  }
  return rec;
}

module.exports = {
  logAuditEvent,
  sanitisePayload,
};

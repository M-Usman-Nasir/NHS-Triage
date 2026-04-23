/**
 * In-memory append-only audit event store (demo / dev parity with database/schema.sql audit_logs).
 * When PostgreSQL is wired, INSERT the same shape into audit_logs and treat this module as a buffer or remove it.
 */

'use strict';

/** @type {Array<object>} */
const events = [];
let seq = 1;

const MAX_EVENTS = parseInt(process.env.AUDIT_MAX_IN_MEMORY_EVENTS || '10000', 10);

function appendEvent(row) {
  const id = seq++;
  const rec = {
    id,
    event_type: row.event_type,
    entity_type: row.entity_type ?? null,
    entity_id: row.entity_id ?? null,
    user_id: row.user_id ?? null,
    ip_address: row.ip_address ?? null,
    payload: row.payload ?? null,
    request_id: row.request_id ?? null,
    created_at: row.created_at || new Date().toISOString(),
  };
  events.push(rec);
  while (events.length > MAX_EVENTS) {
    events.shift();
  }
  return rec;
}

/**
 * @param {{ eventType?: string, entityId?: string }} [filter]
 * @param {{ limit?: number, offset?: number }} [page]
 */
function queryEvents(filter = {}, page = {}) {
  const limit = Math.min(Math.max(parseInt(String(page.limit || 100), 10) || 100, 1), 500);
  const offset = Math.max(parseInt(String(page.offset || 0), 10) || 0, 0);
  let list = events.slice();
  if (filter.eventType) {
    list = list.filter((e) => e.event_type === filter.eventType);
  }
  if (filter.entityId) {
    list = list.filter((e) => e.entity_id === filter.entityId);
  }
  list.reverse();
  const slice = list.slice(offset, offset + limit);
  return { total: list.length, items: slice };
}

function eventsForEntity(entityId) {
  return events.filter((e) => e.entity_id === entityId);
}

module.exports = {
  appendEvent,
  queryEvents,
  eventsForEntity,
};

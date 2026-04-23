-- Migration: immutable audit trail (clinical governance / GDPR accountability)
-- Aligns with backend/lib/auditLog.js INSERT columns.

CREATE TABLE IF NOT EXISTS audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    event_type      VARCHAR(100) NOT NULL,
    entity_type     VARCHAR(50),
    entity_id       UUID,
    user_id         UUID,
    ip_address      INET,
    payload         JSONB,
    request_id      VARCHAR(128),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs (entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs (event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at DESC);

COMMENT ON TABLE audit_logs IS 'Append-only governance log; do not UPDATE/DELETE in application code.';

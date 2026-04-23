-- Migration: add request_id if database was created from an older schema.sql (no-op when column already exists)

ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS request_id VARCHAR(128);

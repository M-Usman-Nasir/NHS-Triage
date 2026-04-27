-- Clinical governance layer:
-- 1) Rule versioning metadata
-- 2) Controlled rule editing workflow (change requests / review / approval)
-- 3) Audit log compatibility columns (action/data/timestamp)

-- ---- Rule versioning metadata on existing rules table ----
ALTER TABLE clinical_rules
  ADD COLUMN IF NOT EXISTS rule_version VARCHAR(20) NOT NULL DEFAULT '1.0',
  ADD COLUMN IF NOT EXISTS updated_by VARCHAR(150),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ---- Controlled editing workflow ----
CREATE TABLE IF NOT EXISTS clinical_rule_change_requests (
  id BIGSERIAL PRIMARY KEY,
  rule_id UUID REFERENCES clinical_rules(id) ON DELETE CASCADE,
  pathway_code VARCHAR(50) REFERENCES clinical_pathways(code),
  proposed_rule_version VARCHAR(20) NOT NULL,
  proposed_condition TEXT NOT NULL,
  proposed_action VARCHAR(50) NOT NULL,
  proposed_priority INTEGER DEFAULT 1,
  requested_by VARCHAR(150) NOT NULL,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  review_status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (review_status IN ('draft', 'reviewed', 'approved', 'rejected')),
  reviewed_by VARCHAR(150),
  reviewed_at TIMESTAMPTZ,
  approved_by VARCHAR(150),
  approved_at TIMESTAMPTZ,
  cso_validated BOOLEAN NOT NULL DEFAULT FALSE,
  cso_validated_by VARCHAR(150),
  cso_validated_at TIMESTAMPTZ,
  review_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_rule_change_requests_rule_id
  ON clinical_rule_change_requests(rule_id);
CREATE INDEX IF NOT EXISTS idx_rule_change_requests_status
  ON clinical_rule_change_requests(review_status);
CREATE INDEX IF NOT EXISTS idx_rule_change_requests_pathway
  ON clinical_rule_change_requests(pathway_code);

-- ---- Mandatory audit compatibility columns ----
ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS action VARCHAR(100),
  ADD COLUMN IF NOT EXISTS data JSONB,
  ADD COLUMN IF NOT EXISTS "timestamp" TIMESTAMPTZ DEFAULT NOW();

-- Keep existing rows queryable through mandatory naming
UPDATE audit_logs
SET
  action = COALESCE(action, event_type),
  data = COALESCE(data, payload),
  "timestamp" = COALESCE("timestamp", created_at)
WHERE action IS NULL OR data IS NULL OR "timestamp" IS NULL;

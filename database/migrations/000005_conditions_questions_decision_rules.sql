-- Pharmacy First condition modeling tables
-- Requested structure:
-- conditions, questions, decision_rules
-- with explicit outcome types:
-- self_care, pharmacy, gp_referral, urgent, emergency

CREATE TABLE IF NOT EXISTS conditions (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  min_age INTEGER,
  max_age INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (min_age IS NULL OR min_age >= 0),
  CHECK (max_age IS NULL OR max_age >= 0),
  CHECK (
    min_age IS NULL
    OR max_age IS NULL
    OR min_age <= max_age
  )
);

CREATE TABLE IF NOT EXISTS questions (
  id BIGSERIAL PRIMARY KEY,
  condition_id BIGINT NOT NULL REFERENCES conditions(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  type VARCHAR(30) NOT NULL CHECK (type IN ('boolean', 'select', 'text', 'multiselect')),
  options JSONB,
  red_flag BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 1,
  required BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS decision_rules (
  id BIGSERIAL PRIMARY KEY,
  condition_id BIGINT NOT NULL REFERENCES conditions(id) ON DELETE CASCADE,
  logic_json JSONB NOT NULL,
  outcome_type VARCHAR(30) NOT NULL CHECK (
    outcome_type IN ('self_care', 'pharmacy', 'gp_referral', 'urgent', 'emergency')
  ),
  priority INTEGER NOT NULL DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conditions_slug
  ON conditions(slug);

CREATE INDEX IF NOT EXISTS idx_questions_condition_id
  ON questions(condition_id);

CREATE INDEX IF NOT EXISTS idx_questions_red_flag
  ON questions(red_flag);

CREATE INDEX IF NOT EXISTS idx_decision_rules_condition_id
  ON decision_rules(condition_id);

CREATE INDEX IF NOT EXISTS idx_decision_rules_outcome_type
  ON decision_rules(outcome_type);


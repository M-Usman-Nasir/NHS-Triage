-- ============================================================
-- Care Path — PostgreSQL Database Schema
-- Version: V0.1
-- Description: Core tables for patient consultations, triage
--              outcomes, clinical rules, and audit logging.
--
-- Incremental DDL for new environments: database/migrations/*.sql
-- Apply with: cd backend && npm run migrate  (requires DATABASE_URL)
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- TABLE: patients
-- Stores basic patient demographic data collected at the start
-- of each consultation session.
-- ------------------------------------------------------------
CREATE TABLE patients (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name       VARCHAR(150) NOT NULL,
    date_of_birth   DATE NOT NULL,
    gender          VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
    postcode        VARCHAR(10),
    phone           VARCHAR(20),
    email           VARCHAR(150),
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- TABLE: consultations
-- One record per consultation session. Links to a patient and
-- stores the submitted symptom data and triage result.
-- ------------------------------------------------------------
CREATE TABLE consultations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id          UUID REFERENCES patients(id) ON DELETE CASCADE,
    session_token       VARCHAR(255) UNIQUE,           -- anonymous session key
    pathway             VARCHAR(100) NOT NULL,          -- e.g. 'uti', 'sore_throat'
    symptoms            JSONB NOT NULL,                 -- array of reported symptoms
    answers             JSONB NOT NULL,                 -- full Q&A from questionnaire
    red_flag_triggered  BOOLEAN DEFAULT FALSE,
    red_flag_reasons    TEXT[],                         -- list of triggered red flags
    outcome             VARCHAR(50) NOT NULL CHECK (
                            outcome IN (
                                'self_care',
                                'pharmacy',
                                'gp',
                                'urgent_care',
                                'emergency_999'
                            )
                        ),
    outcome_reason      TEXT,                           -- plain English explanation
    pharmacy_eligible   BOOLEAN DEFAULT FALSE,
    summary_text        TEXT,                           -- generated consultation summary
    status              VARCHAR(20) DEFAULT 'completed' CHECK (
                            status IN ('in_progress', 'completed', 'abandoned')
                        ),
    created_at          TIMESTAMP DEFAULT NOW(),
    completed_at        TIMESTAMP
);

-- ------------------------------------------------------------
-- TABLE: clinical_pathways
-- Defines each supported clinical condition and its metadata.
-- The actual decision logic lives in JSON files but this table
-- tracks which pathways are active.
-- ------------------------------------------------------------
CREATE TABLE clinical_pathways (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(50) UNIQUE NOT NULL,        -- e.g. 'sore_throat'
    name            VARCHAR(150) NOT NULL,              -- e.g. 'Sore Throat'
    description     TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    version         VARCHAR(20) DEFAULT '1.0',
    last_reviewed   DATE,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- TABLE: clinical_rules
-- Stores individual rules within each pathway. Used by the
-- admin dashboard to view/edit rules without code changes.
-- ------------------------------------------------------------
CREATE TABLE clinical_rules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pathway_code    VARCHAR(50) REFERENCES clinical_pathways(code),
    rule_type       VARCHAR(30) NOT NULL CHECK (
                        rule_type IN ('red_flag', 'eligibility', 'escalation', 'outcome')
                    ),
    condition       TEXT NOT NULL,                      -- human-readable condition
    action          VARCHAR(50) NOT NULL,               -- outcome action
    priority        INTEGER DEFAULT 1,                  -- lower = evaluated first
    is_active       BOOLEAN DEFAULT TRUE,
    rule_version    VARCHAR(20) DEFAULT '1.0',
    updated_by      VARCHAR(150),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- TABLE: clinical_rule_change_requests
-- Controlled editing workflow for rules:
-- draft -> reviewed -> approved/rejected
-- Includes explicit CSO validation fields.
-- ------------------------------------------------------------
CREATE TABLE clinical_rule_change_requests (
    id                      BIGSERIAL PRIMARY KEY,
    rule_id                 UUID REFERENCES clinical_rules(id) ON DELETE CASCADE,
    pathway_code            VARCHAR(50) REFERENCES clinical_pathways(code),
    proposed_rule_version   VARCHAR(20) NOT NULL,
    proposed_condition      TEXT NOT NULL,
    proposed_action         VARCHAR(50) NOT NULL,
    proposed_priority       INTEGER DEFAULT 1,
    requested_by            VARCHAR(150) NOT NULL,
    requested_at            TIMESTAMPTZ DEFAULT NOW(),
    review_status           VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (
                                review_status IN ('draft', 'reviewed', 'approved', 'rejected')
                            ),
    reviewed_by             VARCHAR(150),
    reviewed_at             TIMESTAMPTZ,
    approved_by             VARCHAR(150),
    approved_at             TIMESTAMPTZ,
    cso_validated           BOOLEAN DEFAULT FALSE,
    cso_validated_by        VARCHAR(150),
    cso_validated_at        TIMESTAMPTZ,
    review_notes            TEXT
);

-- ------------------------------------------------------------
-- TABLE: pharmacist_reviews
-- Tracks pharmacist actions on consultation cases.
-- ------------------------------------------------------------
CREATE TABLE pharmacist_reviews (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id     UUID REFERENCES consultations(id) ON DELETE CASCADE,
    pharmacist_id       UUID,                           -- references users table
    reviewed_at         TIMESTAMP DEFAULT NOW(),
    pharmacist_notes    TEXT,
    action_taken        VARCHAR(100),                   -- e.g. 'dispensed', 'referred_gp'
    status              VARCHAR(30) DEFAULT 'pending' CHECK (
                            status IN ('pending', 'reviewed', 'referred', 'treated')
                        )
);

-- ------------------------------------------------------------
-- TABLE: users
-- Platform users: patients (anonymous), pharmacists, admins.
-- ------------------------------------------------------------
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(150) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'pharmacist', 'admin')),
    full_name       VARCHAR(150),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW(),
    last_login      TIMESTAMP
);

-- ------------------------------------------------------------
-- TABLE: audit_logs
-- Records every significant event for clinical governance and
-- GDPR accountability. Immutable — never update or delete.
-- ------------------------------------------------------------
CREATE TABLE audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    event_type      VARCHAR(100) NOT NULL,              -- e.g. 'consultation_started'
    action          VARCHAR(100),                       -- compatibility alias for event_type
    entity_type     VARCHAR(50),                        -- e.g. 'consultation'
    entity_id       UUID,
    user_id         UUID,
    ip_address      INET,
    payload         JSONB,                              -- event-specific data
    data            JSONB,                              -- compatibility alias for payload
    request_id      VARCHAR(128),                       -- HTTP / correlation id (see backend middleware)
    created_at      TIMESTAMP DEFAULT NOW(),
    "timestamp"     TIMESTAMPTZ DEFAULT NOW()           -- compatibility alias for created_at
);

-- ------------------------------------------------------------
-- TABLE: analytics_summary
-- Pre-aggregated daily analytics for the admin dashboard.
-- Updated by a nightly job or trigger.
-- ------------------------------------------------------------
CREATE TABLE analytics_summary (
    id                      BIGSERIAL PRIMARY KEY,
    summary_date            DATE UNIQUE NOT NULL,
    total_consultations     INTEGER DEFAULT 0,
    outcome_self_care       INTEGER DEFAULT 0,
    outcome_pharmacy        INTEGER DEFAULT 0,
    outcome_gp              INTEGER DEFAULT 0,
    outcome_urgent_care     INTEGER DEFAULT 0,
    outcome_emergency       INTEGER DEFAULT 0,
    red_flags_triggered     INTEGER DEFAULT 0,
    top_pathway             VARCHAR(100),
    created_at              TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- TABLE: conditions
-- Pharmacy First condition definitions.
-- ------------------------------------------------------------
CREATE TABLE conditions (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    slug            VARCHAR(100) NOT NULL UNIQUE,
    description     TEXT,
    min_age         INTEGER,
    max_age         INTEGER,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (min_age IS NULL OR min_age >= 0),
    CHECK (max_age IS NULL OR max_age >= 0),
    CHECK (min_age IS NULL OR max_age IS NULL OR min_age <= max_age)
);

-- ------------------------------------------------------------
-- TABLE: questions
-- Condition-level questions and red-flag markers.
-- ------------------------------------------------------------
CREATE TABLE questions (
    id              BIGSERIAL PRIMARY KEY,
    condition_id    BIGINT NOT NULL REFERENCES conditions(id) ON DELETE CASCADE,
    question        TEXT NOT NULL,
    type            VARCHAR(30) NOT NULL CHECK (type IN ('boolean', 'select', 'text', 'multiselect')),
    options         JSONB,
    red_flag        BOOLEAN NOT NULL DEFAULT FALSE,
    display_order   INTEGER NOT NULL DEFAULT 1,
    required        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- TABLE: decision_rules
-- Condition-level decision logic payload and outcomes.
-- ------------------------------------------------------------
CREATE TABLE decision_rules (
    id              BIGSERIAL PRIMARY KEY,
    condition_id    BIGINT NOT NULL REFERENCES conditions(id) ON DELETE CASCADE,
    logic_json      JSONB NOT NULL,
    outcome_type    VARCHAR(30) NOT NULL CHECK (
                        outcome_type IN (
                            'self_care',
                            'pharmacy',
                            'gp_referral',
                            'urgent',
                            'emergency'
                        )
                    ),
    priority        INTEGER NOT NULL DEFAULT 1,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- INDEXES — improves query performance for common lookups
-- ------------------------------------------------------------
CREATE INDEX idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX idx_consultations_pathway ON consultations(pathway);
CREATE INDEX idx_consultations_outcome ON consultations(outcome);
CREATE INDEX idx_consultations_created_at ON consultations(created_at);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_clinical_rules_pathway ON clinical_rules(pathway_code);
CREATE INDEX idx_rule_change_requests_rule_id ON clinical_rule_change_requests(rule_id);
CREATE INDEX idx_rule_change_requests_status ON clinical_rule_change_requests(review_status);
CREATE INDEX idx_conditions_slug ON conditions(slug);
CREATE INDEX idx_questions_condition_id ON questions(condition_id);
CREATE INDEX idx_questions_red_flag ON questions(red_flag);
CREATE INDEX idx_decision_rules_condition_id ON decision_rules(condition_id);
CREATE INDEX idx_decision_rules_outcome_type ON decision_rules(outcome_type);

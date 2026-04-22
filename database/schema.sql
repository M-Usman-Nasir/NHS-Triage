-- ============================================================
-- Aegis Health AI — PostgreSQL Database Schema
-- Version: V0.1
-- Description: Core tables for patient consultations, triage
--              outcomes, clinical rules, and audit logging.
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
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT NOW()
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
    entity_type     VARCHAR(50),                        -- e.g. 'consultation'
    entity_id       UUID,
    user_id         UUID,
    ip_address      INET,
    payload         JSONB,                              -- event-specific data
    created_at      TIMESTAMP DEFAULT NOW()
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
-- INDEXES — improves query performance for common lookups
-- ------------------------------------------------------------
CREATE INDEX idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX idx_consultations_pathway ON consultations(pathway);
CREATE INDEX idx_consultations_outcome ON consultations(outcome);
CREATE INDEX idx_consultations_created_at ON consultations(created_at);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_clinical_rules_pathway ON clinical_rules(pathway_code);

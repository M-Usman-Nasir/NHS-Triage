-- Migration: core clinical / user domain (consultations, pathways, rules, analytics)
-- Depends on: pgcrypto for gen_random_uuid()

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(150) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'pharmacist', 'admin')),
    full_name       VARCHAR(150),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    last_login      TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS patients (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name       VARCHAR(150) NOT NULL,
    date_of_birth   DATE NOT NULL,
    gender          VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
    postcode        VARCHAR(10),
    phone           VARCHAR(20),
    email           VARCHAR(150),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clinical_pathways (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(50) UNIQUE NOT NULL,
    name            VARCHAR(150) NOT NULL,
    description     TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    version         VARCHAR(20) DEFAULT '1.0',
    last_reviewed   DATE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clinical_rules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pathway_code    VARCHAR(50) REFERENCES clinical_pathways (code),
    rule_type       VARCHAR(30) NOT NULL CHECK (
                        rule_type IN ('red_flag', 'eligibility', 'escalation', 'outcome')
                    ),
    condition       TEXT NOT NULL,
    action          VARCHAR(50) NOT NULL,
    priority        INTEGER DEFAULT 1,
    is_active       BOOLEAN DEFAULT TRUE,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consultations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id          UUID REFERENCES patients (id) ON DELETE CASCADE,
    session_token       VARCHAR(255) UNIQUE,
    pathway             VARCHAR(100) NOT NULL,
    symptoms            JSONB NOT NULL,
    answers             JSONB NOT NULL,
    red_flag_triggered  BOOLEAN DEFAULT FALSE,
    red_flag_reasons    TEXT[],
    outcome             VARCHAR(50) NOT NULL CHECK (
                            outcome IN (
                                'self_care',
                                'pharmacy',
                                'gp',
                                'urgent_care',
                                'emergency_999'
                            )
                        ),
    outcome_reason      TEXT,
    pharmacy_eligible   BOOLEAN DEFAULT FALSE,
    summary_text        TEXT,
    status              VARCHAR(20) DEFAULT 'completed' CHECK (
                            status IN ('in_progress', 'completed', 'abandoned')
                        ),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    completed_at      TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS pharmacist_reviews (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id     UUID REFERENCES consultations (id) ON DELETE CASCADE,
    pharmacist_id       UUID,
    reviewed_at         TIMESTAMPTZ DEFAULT NOW(),
    pharmacist_notes    TEXT,
    action_taken        VARCHAR(100),
    status              VARCHAR(30) DEFAULT 'pending' CHECK (
                            status IN ('pending', 'reviewed', 'referred', 'treated')
                        )
);

CREATE TABLE IF NOT EXISTS analytics_summary (
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
    created_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON consultations (patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_pathway ON consultations (pathway);
CREATE INDEX IF NOT EXISTS idx_consultations_outcome ON consultations (outcome);
CREATE INDEX IF NOT EXISTS idx_consultations_created_at ON consultations (created_at);
CREATE INDEX IF NOT EXISTS idx_clinical_rules_pathway ON clinical_rules (pathway_code);

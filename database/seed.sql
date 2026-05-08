-- ============================================================
-- Care Path — Seed Data (Mock / Development Only)
-- DO NOT use in production. For local dev and demos only.
-- ============================================================

-- ------------------------------------------------------------
-- Seed: clinical_pathways
-- The 7 conditions supported in Phase 1
-- ------------------------------------------------------------
INSERT INTO clinical_pathways (code, name, description, version, last_reviewed) VALUES
('sore_throat',   'Sore Throat',           'Consultation pathway for sore throat including tonsillitis and pharyngitis', '1.0', '2026-01-01'),
('sinusitis',     'Sinusitis',             'Consultation pathway for acute sinusitis and sinus congestion', '1.0', '2026-01-01'),
('otitis_media',  'Acute Otitis Media',    'Consultation pathway for ear infections in adults', '1.0', '2026-01-01'),
('insect_bites',  'Infected Insect Bites', 'Consultation pathway for insect bites showing signs of infection', '1.0', '2026-01-01'),
('impetigo',      'Impetigo',              'Consultation pathway for bacterial skin infection (impetigo)', '1.0', '2026-01-01'),
('shingles',      'Shingles',              'Consultation pathway for herpes zoster (shingles)', '1.0', '2026-01-01'),
('uti',           'Uncomplicated UTI',     'Consultation pathway for uncomplicated urinary tract infection in women', '1.0', '2026-01-01');

-- ------------------------------------------------------------
-- Seed: users (platform accounts for demo)
-- Passwords here are plain text labels — would be hashed in prod
-- ------------------------------------------------------------
INSERT INTO users (id, email, password_hash, role, full_name) VALUES
('a1b2c3d4-0001-0001-0001-000000000001', 'admin@aegishealth.ai',       'HASHED_PASSWORD', 'admin',      'Dr. Admin User'),
('a1b2c3d4-0002-0002-0002-000000000002', 'pharmacist1@lloyds.nhs.uk',  'HASHED_PASSWORD', 'pharmacist', 'Priya Sharma'),
('a1b2c3d4-0003-0003-0003-000000000003', 'pharmacist2@boots.nhs.uk',   'HASHED_PASSWORD', 'pharmacist', 'James Okafor');

-- ------------------------------------------------------------
-- Seed: patients (10 mock patient records)
-- ------------------------------------------------------------
INSERT INTO patients (id, full_name, date_of_birth, gender, postcode, phone, email) VALUES
('p0000001-0000-0000-0000-000000000001', 'Sarah Mitchell',   '1992-03-14', 'Female',            'SW1A 1AA', '07700900001', 'sarah.mitchell@example.com'),
('p0000001-0000-0000-0000-000000000002', 'James Parker',     '1951-11-22', 'Male',              'M1 1AE',   '07700900002', 'james.parker@example.com'),
('p0000001-0000-0000-0000-000000000003', 'Aisha Patel',      '1988-07-05', 'Female',            'B1 1BB',   '07700900003', 'aisha.patel@example.com'),
('p0000001-0000-0000-0000-000000000004', 'Tom Henderson',    '1975-01-30', 'Male',              'LS1 1AB',  '07700900004', 'tom.henderson@example.com'),
('p0000001-0000-0000-0000-000000000005', 'Fatima Al-Hassan', '2000-09-18', 'Female',            'E1 6AN',   '07700900005', 'fatima.alhassan@example.com'),
('p0000001-0000-0000-0000-000000000006', 'David Chen',       '1965-06-12', 'Male',              'BS1 4DJ',  '07700900006', 'david.chen@example.com'),
('p0000001-0000-0000-0000-000000000007', 'Emma Wilson',      '2001-04-25', 'Female',            'OX1 1NP',  '07700900007', 'emma.wilson@example.com'),
('p0000001-0000-0000-0000-000000000008', 'Robert Okafor',    '1983-12-03', 'Male',              'NE1 7RU',  '07700900008', 'robert.okafor@example.com'),
('p0000001-0000-0000-0000-000000000009', 'Chloe Davies',     '1995-08-17', 'Female',            'CF10 1EP', '07700900009', 'chloe.davies@example.com'),
('p0000001-0000-0000-0000-000000000010', 'Mohammed Iqbal',   '1970-02-08', 'Male',              'BB1 1AA',  '07700900010', 'mohammed.iqbal@example.com');

-- ------------------------------------------------------------
-- Seed: consultations (5 completed mock consultations)
-- Each demonstrates a different outcome pathway
-- ------------------------------------------------------------

-- Consultation 1: Sarah Mitchell — UTI → Pharmacy referral
INSERT INTO consultations (
    id, patient_id, session_token, pathway, symptoms, answers,
    red_flag_triggered, outcome, outcome_reason, pharmacy_eligible,
    summary_text, status, completed_at
) VALUES (
    'c0000001-0000-0000-0000-000000000001',
    'p0000001-0000-0000-0000-000000000001',
    'sess_demo_001',
    'uti',
    '["painful urination", "frequent urination", "lower abdominal pain"]',
    '{
        "q1": "3 days",
        "q2": false,
        "q3": false,
        "q4": "No",
        "q5": "No",
        "q6": "No known allergies"
    }',
    FALSE,
    'pharmacy',
    'Symptoms are consistent with an uncomplicated UTI. Patient meets pharmacy eligibility criteria. No red flags identified.',
    TRUE,
    'Patient: Sarah Mitchell (F, 33). Symptoms: Painful urination, frequent urination, lower abdominal pain for 3 days. No fever, no back pain, no pregnancy. OUTCOME: Pharmacy referral — eligible for pharmacy-led treatment under Pharmacy First scheme. Recommended: Trimethoprim or Nitrofurantoin (subject to pharmacist assessment). No red flags detected.',
    'completed',
    NOW() - INTERVAL '2 days'
);

-- Consultation 2: James Parker — Chest pain → Emergency 999
INSERT INTO consultations (
    id, patient_id, session_token, pathway, symptoms, answers,
    red_flag_triggered, red_flag_reasons, outcome, outcome_reason,
    pharmacy_eligible, summary_text, status, completed_at
) VALUES (
    'c0000001-0000-0000-0000-000000000002',
    'p0000001-0000-0000-0000-000000000002',
    'sess_demo_002',
    'sore_throat',
    '["chest pain", "shortness of breath", "sweating", "left arm pain"]',
    '{
        "q1": "sudden onset",
        "q2": true,
        "q3": true,
        "q4": "radiating to left arm"
    }',
    TRUE,
    '{"RED_FLAG_CARDIAC": "Chest pain with radiation to arm and shortness of breath — potential cardiac emergency"}',
    'emergency_999',
    'RED FLAG DETECTED: Symptoms suggest possible cardiac emergency. Patient instructed to call 999 immediately.',
    FALSE,
    'URGENT: Patient: James Parker (M, 74). RED FLAG TRIGGERED — Cardiac symptoms detected. Symptoms: Chest pain, shortness of breath, sweating, left arm pain. OUTCOME: Emergency 999. Patient advised to call 999 immediately and not to drive. Do not administer food or drink.',
    'completed',
    NOW() - INTERVAL '5 days'
);

-- Consultation 3: Aisha Patel — Sore throat → GP referral
INSERT INTO consultations (
    id, patient_id, session_token, pathway, symptoms, answers,
    red_flag_triggered, outcome, outcome_reason, pharmacy_eligible,
    summary_text, status, completed_at
) VALUES (
    'c0000001-0000-0000-0000-000000000003',
    'p0000001-0000-0000-0000-000000000003',
    'sess_demo_003',
    'sore_throat',
    '["severe sore throat", "high fever", "difficulty swallowing", "rash"]',
    '{
        "q1": "5 days",
        "q2": true,
        "q3": false,
        "q4": "38.9 degrees",
        "q5": "Yes — red rash on chest"
    }',
    FALSE,
    'gp',
    'Sore throat lasting 5 days with high fever and rash. Possible scarlet fever — requires GP assessment and potential antibiotic prescription.',
    FALSE,
    'Patient: Aisha Patel (F, 37). Symptoms: Severe sore throat, fever (38.9°C), difficulty swallowing, rash on chest for 5 days. OUTCOME: GP referral — Presentation consistent with possible scarlet fever or severe bacterial tonsillitis. Requires in-person assessment. Pharmacy treatment not appropriate.',
    'completed',
    NOW() - INTERVAL '1 day'
);

-- Consultation 4: Emma Wilson — Sinusitis → Self-care advice
INSERT INTO consultations (
    id, patient_id, session_token, pathway, symptoms, answers,
    red_flag_triggered, outcome, outcome_reason, pharmacy_eligible,
    summary_text, status, completed_at
) VALUES (
    'c0000001-0000-0000-0000-000000000007',
    'p0000001-0000-0000-0000-000000000007',
    'sess_demo_004',
    'sinusitis',
    '["blocked nose", "facial pressure", "headache"]',
    '{
        "q1": "2 days",
        "q2": false,
        "q3": false,
        "q4": "mild",
        "q5": "No"
    }',
    FALSE,
    'self_care',
    'Mild sinusitis symptoms for 2 days. No red flags. Viral origin likely — self-care appropriate at this stage.',
    FALSE,
    'Patient: Emma Wilson (F, 24). Symptoms: Blocked nose, facial pressure, mild headache for 2 days. No fever. No previous recurrence. OUTCOME: Self-care — Symptoms suggest viral sinusitis. Advise: steam inhalation, saline nasal spray, paracetamol for pain. Return if symptoms worsen or persist beyond 10 days.',
    'completed',
    NOW() - INTERVAL '3 days'
);

-- Consultation 5: Chloe Davies — Shingles → Pharmacy (urgent)
INSERT INTO consultations (
    id, patient_id, session_token, pathway, symptoms, answers,
    red_flag_triggered, outcome, outcome_reason, pharmacy_eligible,
    summary_text, status, completed_at
) VALUES (
    'c0000001-0000-0000-0000-000000000009',
    'p0000001-0000-0000-0000-000000000009',
    'sess_demo_005',
    'shingles',
    '["painful rash on one side", "blistering skin", "burning sensation", "nerve pain"]',
    '{
        "q1": "1 day",
        "q2": false,
        "q3": false,
        "q4": "left torso",
        "q5": "No",
        "q6": "No immunosuppression"
    }',
    FALSE,
    'pharmacy',
    'Presentation consistent with shingles within 72-hour treatment window. Antiviral treatment via pharmacy is appropriate.',
    TRUE,
    'Patient: Chloe Davies (F, 30). Symptoms: Painful unilateral rash, blistering skin, burning/nerve pain on left torso onset today. OUTCOME: Urgent pharmacy referral — Shingles within antiviral treatment window (< 72 hours). Antiviral therapy (e.g. Aciclovir) should be initiated as soon as possible. Pharmacist to assess and prescribe.',
    'completed',
    NOW() - INTERVAL '4 hours'
);

-- ------------------------------------------------------------
-- Seed: audit_logs (sample audit trail entries)
-- ------------------------------------------------------------
INSERT INTO audit_logs (event_type, entity_type, entity_id, payload) VALUES
('consultation_started',   'consultation', 'c0000001-0000-0000-0000-000000000001', '{"pathway": "uti", "patient_id": "p0000001-0000-0000-0000-000000000001"}'),
('red_flag_triggered',     'consultation', 'c0000001-0000-0000-0000-000000000002', '{"flag": "RED_FLAG_CARDIAC", "outcome": "emergency_999"}'),
('consultation_completed', 'consultation', 'c0000001-0000-0000-0000-000000000003', '{"outcome": "gp", "pathway": "sore_throat"}'),
('pharmacist_review',      'consultation', 'c0000001-0000-0000-0000-000000000001', '{"pharmacist": "Priya Sharma", "action": "dispensed"}'),
('consultation_completed', 'consultation', 'c0000001-0000-0000-0000-000000000009', '{"outcome": "pharmacy", "pathway": "shingles"}');

-- ------------------------------------------------------------
-- Seed: analytics_summary (last 7 days of mock data)
-- ------------------------------------------------------------
INSERT INTO analytics_summary (summary_date, total_consultations, outcome_self_care, outcome_pharmacy, outcome_gp, outcome_urgent_care, outcome_emergency, red_flags_triggered, top_pathway) VALUES
('2026-04-14', 42, 12, 18, 8,  2, 2, 3, 'uti'),
('2026-04-15', 38, 10, 15, 9,  2, 2, 2, 'sore_throat'),
('2026-04-16', 55, 18, 22, 10, 3, 2, 4, 'uti'),
('2026-04-17', 61, 20, 25, 12, 2, 2, 3, 'sinusitis'),
('2026-04-18', 47, 15, 19, 9,  2, 2, 2, 'uti'),
('2026-04-19', 33, 10, 12, 7,  2, 2, 1, 'shingles'),
('2026-04-20', 58, 19, 24, 11, 2, 2, 3, 'uti');

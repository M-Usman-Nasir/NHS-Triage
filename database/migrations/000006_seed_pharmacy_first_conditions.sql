-- Seed NHS Pharmacy First core condition set.
-- Idempotent upsert by unique slug so repeated migration runs stay safe.
--
-- Verification snippet (run manually after migration):
-- SELECT slug, name, min_age, max_age
-- FROM conditions
-- WHERE slug IN (
--   'uti',
--   'sore_throat',
--   'sinusitis',
--   'otitis_media',
--   'insect_bites',
--   'impetigo',
--   'shingles'
-- )
-- ORDER BY slug;

INSERT INTO conditions (name, slug, description, min_age, max_age)
VALUES
  (
    'Uncomplicated UTI',
    'uti',
    'Community pharmacy assessment pathway for uncomplicated lower urinary tract infection.',
    16,
    64
  ),
  (
    'Sore Throat',
    'sore_throat',
    'Community pharmacy pathway for acute sore throat with FeverPAIN-aligned triage logic.',
    5,
    NULL
  ),
  (
    'Sinusitis',
    'sinusitis',
    'Community pharmacy pathway for acute sinusitis with duration and red-flag screening.',
    12,
    NULL
  ),
  (
    'Acute Otitis Media',
    'otitis_media',
    'Community pharmacy pathway for acute otitis media in age-eligible pediatric cohorts.',
    1,
    17
  ),
  (
    'Infected Insect Bites',
    'insect_bites',
    'Community pharmacy pathway for infected insect bites with worsening and sepsis screening.',
    1,
    NULL
  ),
  (
    'Impetigo',
    'impetigo',
    'Community pharmacy pathway for localized impetigo with exclusion and spread criteria.',
    1,
    NULL
  ),
  (
    'Shingles',
    'shingles',
    'Community pharmacy pathway for shingles with timing and ophthalmic/ear red-flag screening.',
    18,
    NULL
  )
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  min_age = EXCLUDED.min_age,
  max_age = EXCLUDED.max_age,
  updated_at = NOW();


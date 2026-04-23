# SQL migrations (PostgreSQL)

Ordered `*.sql` files apply **once** each, tracked in table `schema_migrations` (the runner creates this table before applying files).

## Apply

```bash
cd backend
npm install
# PowerShell:
$env:DATABASE_URL="postgres://user:pass@localhost:5432/aegis"
npm run migrate
```

Requirements:

- PostgreSQL **12+** recommended (`CREATE INDEX IF NOT EXISTS`, `TIMESTAMPTZ`).
- Use an **empty** database for a clean install, or expect `IF NOT EXISTS` to skip existing objects.

## Files

| File | Purpose |
|------|---------|
| `000001_audit_logs.sql` | Immutable `audit_logs` + indexes (includes `request_id`) |
| `000002_core_domain_tables.sql` | Extensions, users, patients, pathways, rules, consultations, reviews, analytics |
| `000003_audit_logs_request_id_backfill.sql` | `ALTER ... ADD COLUMN IF NOT EXISTS` for legacy DBs created before `request_id` |

## Canonical reference

Keep `database/schema.sql` aligned with these migrations when the physical model changes. For new columns or tables, add **`000004_...sql`** (next number) and update `schema.sql` in the same change.

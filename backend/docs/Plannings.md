# Backend planning

Programme-wide planning, API shape, rule-engine behaviour, and **what is built vs missing** live in the repo root docs:

- **[../../docs/PLATFORM-HANDBOOK.md](../../docs/PLATFORM-HANDBOOK.md)** — canonical technical handbook (includes persistence gaps, summary vs consultation store, epics).
- **[../../docs/CLINICAL-GOVERNANCE.md](../../docs/CLINICAL-GOVERNANCE.md)** — clinical and compliance (**§5.1–5.3** regulatory/market positioning; NHS integration tiers **§8**; deferred ML **§9**).

**Database:** `database/schema.sql` + ordered migrations in `database/migrations/` — apply with `cd backend && npm run migrate` when `DATABASE_URL` is set (see handbook §9 implementation status).

# Canonical Pathway Registry (Phase 1)

`pathways.master.json` is the canonical list of NHS pathway runtime files for Phase 1.

Sync strategy:
- Keep `pathways.master.json` updated when adding/removing runtime pathway files in `backend/data/pathways/`.
- Run `npm test -- --runTestsByPath __tests__/pathway.schema.validation.test.js` to enforce:
  - runtime pathways match canonical registry entries
  - each runtime pathway matches `pathway.schema.json`

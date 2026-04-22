# JSON Schemas (contracts)

Draft-07 JSON Schema files describe the **intended** request/response shapes for patient consultation and summary APIs. They are used for documentation and future validation (e.g. OpenAPI, CI checks); the live backend remains the source of truth until contract tests are wired.

| File | Endpoint |
|------|----------|
| `consultation-post.request.json` | `POST /api/consultation` body |
| `summary-get.response.json` | `GET /api/summary/:id` success body |

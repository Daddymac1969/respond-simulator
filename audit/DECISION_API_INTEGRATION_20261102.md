# Simulator Decision API integration — DRAFT / RELEASE HOLD

This branch is a proposed integration with the **existing RESPOND decision service**, specifically its `POST /api/v1/evaluate` policy endpoint. It is NOT an implementation of an unverified OpenAI `/v1/decisions` endpoint.

## Intended architecture
Browser -> Netlify function (server access code, validation, fixed system prompt and model) -> RESPOND Decision API (input policy) -> Anthropic for fictional scenario generation -> RESPOND Decision API (output policy) -> Browser.

The Decision API returns a policy classification (ALLOW/WARN/BLOCK/ESCALATE). It **does not generate scenarios, score professional competence or certify safeguarding accuracy**. This is a fail-closed policy gate; WARN, BLOCK and ESCALATE are held, not silently allowed. A locally running API at 127.0.0.1 is not reachable from Netlify; IT must provide a secured, authorised network deployment before this integration can function.

## Server-only environment variables
- `SIMULATOR_ACCESS_SECRET`: independent high-entropy access code. Shared-code authentication is a provisional control; rate limits and stronger user identity are required before public launch.
- `RESPOND_DECISION_API_URL`: HTTPS URL of the authorised RESPOND `/api/v1/evaluate` endpoint.
- `RESPOND_DECISION_API_KEY`: server-only key for that endpoint.
- `ANTHROPIC_API_KEY`: existing provider credential.

No values should be committed to GitHub or placed in browser JavaScript. Do not configure live credentials or enable production deployment until IT and DPO approval.

## Current limitations / release holds
1. The backend fixes model and system instructions server-side, validates roles, bounds messages, and requires a successful policy evaluation before and after generation. The policy schema and `interaction_type` values must be checked against the **actual deployed RAIS version**. No live API calls have been made.
2. The simulator still trusts generative scores, RAG labels, statutory references and step transitions. An independent deterministic scoring rubric, source-verified statutory curriculum and robust response schema remain REQUIRED. Generated scores must not be used as evidence of staff competence.
3. The Google Apps Script endpoints are deliberately disabled. Any logging must be rebuilt as a server-authenticated, privacy-reviewed service with minimised fields and consent/retention decisions.
4. Access-code prompt is a temporary UI. There is no server-side per-user identity, rate limiting, budget cap or abuse throttling. Public release is blocked.
5. Actual Netlify deployment source, browser accessibility, error recovery, incident escalation, DSL and DPO approval are not verified.
6. The user-visible training script's asserted 30-minute escalation/recording deadlines and historical statutory citations require safeguarding review. No legal wording is silently changed.

## Offline verification
`node --check netlify/functions/respond-api.js`
`node --test tests/*.test.js`

Tests use synthetic inputs and mocked policy/model calls. CI must be inspected at the exact PR head; no PASS claim until the workflow actually runs.

## Audit checkpoint
Base: main `e49f02d95abba7322e102d2992133436a5c051ef`.
Branch: `audit/decision-api-gate-20261102`.
Issues: #2 AI proxy, #3 assessment integrity, #4 logging, #5 UI.
No merges, live model calls, student data, real case logging, production configuration or deployment changes.

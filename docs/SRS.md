# Voxora Software Requirements Specification

Document ID: VOX-SRS-001  
Status: Architecture foundation  
Audience: Product, engineering, security, and operations

## 1. Purpose

Voxora enables organizations to create, govern, and deliver reusable spoken content without coupling their product to one speech vendor. The platform must remain accessible, tenant-safe, auditable, and predictable under usage limits.

## 2. Actors

| Actor      | Responsibilities                                             |
| ---------- | ------------------------------------------------------------ |
| Owner      | Workspace lifecycle, billing, security, and all content      |
| Admin      | Members, API access, settings, content, and reporting        |
| Editor     | Phrase and speech workflow management                        |
| Viewer     | Read-only dashboard, phrases, and usage reporting            |
| API client | Versioned speech requests within an assigned workspace       |
| Operator   | Reliability, incident response, and privacy-safe diagnostics |

## 3. Functional requirements

### Workspace and access

- FR-001: Every mutable business record must have an immutable `workspace_id`.
- FR-002: Server-side authorization must evaluate membership and role for every protected action.
- FR-003: A user may hold different roles in different workspaces.
- FR-004: Owner-only actions include ownership transfer, billing changes, and workspace deletion.

### Phrase library

- FR-010: Editors may create, update, archive, search, and categorize phrases.
- FR-011: Phrases must store locale, author, status, and timestamps.
- FR-012: Viewers may preview active phrases but may not mutate them.
- FR-013: Dari and English content must render correctly in RTL and LTR contexts.

### Speech workflow

- FR-020: Clients submit text, locale, voice preferences, and output format through a versioned contract.
- FR-021: The platform validates authorization and reserves usage before dispatching provider work.
- FR-022: Each request supports a workspace-scoped idempotency key.
- FR-023: Provider adapters must return normalized states: `QUEUED`, `PROCESSING`, `SUCCEEDED`, or `FAILED`.
- FR-024: Provider failure must release reserved usage or mark it for reconciliation.

### Usage and billing

- FR-030: A workspace cannot reserve characters beyond its monthly limit.
- FR-031: Usage reservation and request creation must commit atomically.
- FR-032: Owners and admins may view usage trends and threshold warnings.
- FR-033: Billing-provider events must be idempotent and auditable.

### Audit and API access

- FR-040: Role, key, billing, export, and content changes must create audit events.
- FR-041: API keys must be stored as hashes and shown only at creation time.
- FR-042: Public API errors must use stable machine-readable codes and correlation IDs.

## 4. Non-functional requirements

- NFR-001 Security: Tenant isolation and authorization are server-side invariants.
- NFR-002 Accessibility: Core journeys target WCAG 2.2 AA, keyboard operation, visible focus, and reduced motion.
- NFR-003 Reliability: Idempotent writes, bounded retries, dead-letter handling, and documented recovery.
- NFR-004 Performance: p95 dashboard reads under 500 ms and API acceptance under 300 ms, excluding provider work.
- NFR-005 Observability: Structured logs, metrics, traces, and correlation IDs without raw speech text.
- NFR-006 Privacy: User content is excluded from logs and has configurable retention.
- NFR-007 Internationalization: Locale-aware content with English and Dari foundations.
- NFR-008 Maintainability: Domain rules remain independent of frameworks and external providers.

## 5. First vertical slice acceptance criteria

- A professional responsive product page and workspace dashboard run locally.
- Browser speech preview is accessible. Local mode transmits no text; configured OpenAI mode requires an AI-generated-voice disclosure before playback.
- RBAC, usage reservation, and speech-request rules have deterministic unit tests.
- `/api/health` reports build-safe service metadata.
- `/api/v1/speech-requests` validates its public contract and enforces role requirements.
- PostgreSQL/Redis development services, CI, Docker configuration, and operational docs are present.
- Lint, typecheck, unit tests, production build, and desktop/mobile browser tests pass.

## 6. Explicitly deferred

External identity, durable persistence adapters, queue workers, payment provider integration, production provider observability, and customer data import are milestones after this architecture slice. The OpenAI speech adapter is implemented and contract-tested, but durable worker dispatch must not be represented as complete before its persistence and production tests exist.

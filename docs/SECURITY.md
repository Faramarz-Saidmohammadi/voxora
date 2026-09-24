# Security Model

## Trust boundaries

The browser, external API clients, webhooks, queue payloads, and speech providers are untrusted. Runtime validation occurs at every boundary. Domain authorization never relies on hidden UI controls.

## Tenant isolation

- Tenant identity comes from the authenticated session or API key, never a mutable request body alone.
- Repository methods require `workspaceId` and include it in filters and unique constraints.
- Idempotency keys are unique within a workspace, not globally.
- Audit queries are tenant-scoped except for explicit operator workflows.

## Authentication and sessions

The production milestone uses short-lived signed HttpOnly, Secure, SameSite cookies with rotation and server-side revocation. Password credentials, if enabled, use a memory-hard KDF. External OIDC is preferred for business tenants.

The current API route uses clearly documented demo headers to exercise contracts locally. Those headers are not a production authentication mechanism and must be removed when the session/API-key adapter lands.

## Sensitive data

- Raw phrase and speech text must not appear in logs, traces, analytics, or error reports.
- Provider requests use the minimum required content and configuration.
- `OPENAI_API_KEY` is server-only configuration and must never use the `NEXT_PUBLIC_` prefix.
- Local preview transmits no text. OpenAI preview transmits the requested text only after the user activates generation and displays an AI-voice disclosure.
- Provider failures are normalized; upstream response bodies and credentials never reach clients.
- Stored audio uses private object storage and expiring signed URLs.
- API key material is displayed once and stored only as a keyed hash.

## Abuse and reliability controls

- Per-principal and per-workspace rate limits
- Usage reservation before provider dispatch
- Payload size and locale allowlists
- Paid speech generation stays disabled unless the provider and key are explicitly configured
- Idempotent requests and webhook handlers
- Bounded retries with dead-letter inspection
- Security headers and strict content policies at the edge

## Reporting

Do not open public issues for vulnerabilities. Use GitHub's private vulnerability reporting for this repository when enabled.

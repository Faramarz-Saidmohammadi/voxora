# Operations Guide

## Runtime configuration

| Variable              | Required                 | Purpose                                                         |
| --------------------- | ------------------------ | --------------------------------------------------------------- |
| `DATABASE_URL`        | Infrastructure milestone | Tenant-scoped PostgreSQL connection                             |
| `REDIS_URL`           | Worker milestone         | Durable queue and rate-limit coordination                       |
| `SESSION_SECRET`      | Identity milestone       | Signed session protection                                       |
| `SPEECH_PROVIDER`     | Yes                      | `browser-demo` by default; `openai` enables external generation |
| `OPENAI_API_KEY`      | OpenAI mode              | Server-only project credential                                  |
| `OPENAI_SPEECH_MODEL` | No                       | Defaults to `gpt-4o-mini-tts`                                   |
| `NEXT_PUBLIC_APP_URL` | Yes                      | Canonical public application URL                                |

## Deployment gates

Before a public deployment with a paid speech provider:

1. Replace demo identity headers with signed sessions or scoped API keys.
2. Add distributed per-principal and per-workspace rate limits.
3. Persist idempotency keys and usage reservations atomically.
4. Dispatch long-running work through the durable queue worker.
5. Store audio privately and return expiring signed URLs.
6. Configure provider spend alerts, project limits, and credential rotation.
7. Export latency, error class, retry, and usage metrics without speech content.
8. Complete load, failure-injection, retention, and recovery tests.

## Health and verification

- `GET /api/health` verifies the web process and defensive response headers.
- CI `quality` verifies formatting, linting, types, unit tests, coverage, and build output.
- CI `browser` verifies desktop, mobile, API, authorization, validation, and provider-disable behavior.

The health endpoint deliberately does not call the paid speech provider. Provider health should be inferred from bounded real traffic and operational metrics, not synthetic calls that create cost and noise.

## Provider failure handling

| Condition                                        | Client behavior                                   | Operator action                                                         |
| ------------------------------------------------ | ------------------------------------------------- | ----------------------------------------------------------------------- |
| Provider disabled or invalid credentials         | `503 SPEECH_PROVIDER_UNAVAILABLE`                 | Verify environment configuration and rotate credentials if required     |
| Rate limit, timeout, connection, or server error | `502 SPEECH_GENERATION_FAILED` with `Retry-After` | Inspect provider limits, latency, and retry volume                      |
| Non-retryable provider request failure           | `502 SPEECH_GENERATION_FAILED`                    | Inspect sanitized structured telemetry and validate model configuration |
| Workspace usage exhausted                        | `409 USAGE_LIMIT_EXCEEDED`                        | Review plan limits and usage reconciliation                             |

Never include raw speech text, API keys, provider response bodies, or generated audio in logs or incident tickets.

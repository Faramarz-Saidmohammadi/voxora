# Voxora

Voxora is a multi-tenant voice-accessibility SaaS for teams that need governed, reusable speech experiences across products, support workflows, and public services.

This repository is intentionally built as a production-oriented modular monolith: a Next.js application at the edge of the system, framework-independent domain packages, explicit contracts, PostgreSQL and Redis infrastructure boundaries, and automated quality gates.

## Product capabilities

- Workspace-scoped phrase libraries and voice presets
- `OWNER`, `ADMIN`, `EDITOR`, and `VIEWER` authorization
- Provider-independent speech-request contracts
- Usage budgets, idempotency, and billing-ready metering
- Auditability for sensitive workspace actions
- Accessible browser voice preview with keyboard-friendly controls
- Public health and versioned API routes

## Architecture

```text
apps/web            Next.js App Router product and API surface
packages/contracts  Runtime-validated public request/response contracts
packages/domain     Tenant authorization, usage, and speech workflow rules
infra               Local PostgreSQL and Redis services
docs                SRS, architecture, security, API, and ADRs
```

The first release keeps deployable units deliberately small. Business rules do not depend on Next.js, a database client, or a speech vendor, so the system can add workers and providers without rewriting the core.

## Quick start

Requirements: Node.js 24 LTS, npm 11+, and Docker for optional local infrastructure.

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000` for the product overview and `http://localhost:3000/dashboard` for the workspace experience.

Optional infrastructure:

```bash
docker compose up -d
```

## Quality gates

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

## Documentation

- [Software requirements](docs/SRS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Security model](docs/SECURITY.md)
- [API contract](docs/API.md)
- [Modular-monolith decision](docs/adr/0001-modular-monolith.md)

## Delivery status

The repository currently contains the architecture foundation and the first executable vertical slice. PostgreSQL persistence, durable queue adapters, external identity, and real speech providers remain explicit follow-up milestones rather than simulated production features.

## License

MIT

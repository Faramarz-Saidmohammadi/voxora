# ADR 0001: Start with a modular monolith

Status: Accepted

## Context

Voxora has clear asynchronous and provider boundaries, but its initial team and traffic do not justify independently operated microservices. Premature service boundaries would multiply authentication, deployment, observability, and data-consistency work.

## Decision

Use a Turborepo modular monolith with a Next.js web/API deployable, framework-independent domain and contract packages, and an independently runnable worker added when durable provider processing lands.

Business logic depends on ports rather than provider SDKs. PostgreSQL is the system of record; Redis is transport, not authority. Cross-boundary events use a transactional outbox before any service split.

## Consequences

- Local development and transactions remain simple.
- Domain boundaries are testable and ready for future extraction.
- Deployments are intentionally coupled at first.
- A future split requires operational evidence such as independent scaling, ownership, or availability needs.

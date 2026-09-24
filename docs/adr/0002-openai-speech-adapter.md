# ADR 0002: Isolate OpenAI behind the speech-provider port

- Status: Accepted
- Date: 2026-09-24

## Context

Voxora needs high-quality generated speech without coupling domain rules, HTTP contracts, or future queue workers to one vendor SDK. Provider credentials and upstream failure details must remain server-side. The product must also disclose when users hear an AI-generated voice.

## Decision

- Define the provider-neutral `SpeechProvider` port in `@voxora/speech`.
- Implement OpenAI as an adapter using the server-side JavaScript SDK and `gpt-4o-mini-tts` by default.
- Map Voxora's `ogg` contract to the provider's Opus response while preserving the public content type.
- Resolve provider configuration only on the server from `SPEECH_PROVIDER`, `OPENAI_API_KEY`, and `OPENAI_SPEECH_MODEL`.
- Keep external generation disabled by default.
- Validate, authorize, and reserve usage before provider invocation.
- Normalize configuration and upstream errors so credentials and provider response bodies cannot reach clients.
- Present an explicit AI-generated-voice disclosure before playback.

## Consequences

OpenAI can be replaced or supplemented without changing domain code. The adapter can move into a queue worker without redesigning its contract. A production rollout still requires signed identity, distributed rate limiting, durable usage reservation, persistent audio storage, retry policy, and provider observability.

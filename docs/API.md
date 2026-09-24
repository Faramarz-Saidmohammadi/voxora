# API

Base path: `/api/v1`

## Health

`GET /api/health`

```json
{
  "service": "voxora-web",
  "status": "ok",
  "version": "0.1.0"
}
```

## Create speech request

`POST /api/v1/speech-requests`

Foundation-only demo headers:

- `x-voxora-tenant`: workspace identifier
- `x-voxora-actor`: authenticated actor identifier
- `x-voxora-role`: `OWNER`, `ADMIN`, `EDITOR`, or `VIEWER`
- `idempotency-key`: stable client-generated key

These headers exercise the boundary and are not production authentication.

Request:

```json
{
  "text": "Your appointment is confirmed.",
  "locale": "en-US",
  "voice": "calm",
  "format": "mp3"
}
```

Success: `202 Accepted`

```json
{
  "data": {
    "requestId": "uuid",
    "status": "QUEUED",
    "characterCount": 30
  },
  "meta": {
    "correlationId": "uuid"
  }
}
```

Errors use `{ "error": { "code", "message", "details?" }, "meta": { "correlationId" } }`.

## Generate speech preview

`POST /api/v1/speech-generation`

This synchronous endpoint uses the same foundation-only demo identity headers as speech requests and additionally requires `idempotency-key`. It is disabled unless `SPEECH_PROVIDER=openai` and a server-only `OPENAI_API_KEY` are configured.

Request:

```json
{
  "text": "Your appointment is confirmed.",
  "locale": "en-US",
  "voice": "cedar",
  "format": "mp3",
  "instructions": "Speak clearly and calmly."
}
```

Success: `200 OK` with binary audio and these response headers:

- `Content-Type`: `audio/mpeg`, `audio/wav`, or `audio/ogg`
- `X-Correlation-ID`: request correlation identifier
- `X-Voxora-Request-ID`: generated speech request identifier
- `X-Voxora-AI-Disclosure`: `AI-generated voice`
- `Cache-Control`: `no-store`

The synchronous route limits text to 1,200 characters. Missing provider configuration returns `503 SPEECH_PROVIDER_UNAVAILABLE`; normalized upstream failure returns `502 SPEECH_GENERATION_FAILED` without provider response details.

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

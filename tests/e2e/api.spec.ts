import { expect, test } from "@playwright/test";

const speechPath = "/api/v1/speech-requests";
const generationPath = "/api/v1/speech-generation";
const requestBody = { text: "Your appointment is confirmed.", locale: "en-US" };
const requestHeaders = {
  "x-voxora-tenant": "workspace-e2e",
  "x-voxora-actor": "actor-e2e",
  "idempotency-key": "speech-e2e-001",
};

test("reports service health with defensive headers", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.status()).toBe(200);
  expect(response.headers()["x-frame-options"]).toBe("DENY");
  await expect(response.json()).resolves.toMatchObject({ status: "ok" });
});

test("enforces authentication, validation, and workspace roles", async ({
  request,
}) => {
  const unauthenticated = await request.post(speechPath, { data: requestBody });
  expect(unauthenticated.status()).toBe(401);
  await expect(unauthenticated.json()).resolves.toMatchObject({
    error: { code: "UNAUTHENTICATED" },
  });

  const viewer = await request.post(speechPath, {
    data: requestBody,
    headers: { ...requestHeaders, "x-voxora-role": "VIEWER" },
  });
  expect(viewer.status()).toBe(403);
  await expect(viewer.json()).resolves.toMatchObject({
    error: { code: "FORBIDDEN" },
  });

  const invalid = await request.post(speechPath, {
    data: { text: "", locale: "invalid locale" },
    headers: { ...requestHeaders, "x-voxora-role": "EDITOR" },
  });
  expect(invalid.status()).toBe(400);
  await expect(invalid.json()).resolves.toMatchObject({
    error: { code: "INVALID_REQUEST" },
  });
});

test("accepts an authorized, valid, idempotent speech request", async ({
  request,
}) => {
  const response = await request.post(speechPath, {
    data: requestBody,
    headers: {
      ...requestHeaders,
      "x-voxora-role": "EDITOR",
      "x-correlation-id": "correlation-e2e-001",
    },
  });

  expect(response.status()).toBe(202);
  await expect(response.json()).resolves.toMatchObject({
    data: { status: "QUEUED", characterCount: 30 },
    meta: { correlationId: "correlation-e2e-001" },
  });
});

test("protects paid speech generation when no provider is configured", async ({
  request,
}) => {
  const response = await request.post(generationPath, {
    data: { ...requestBody, voice: "cedar", format: "mp3" },
    headers: {
      ...requestHeaders,
      "x-voxora-role": "EDITOR",
      "x-correlation-id": "correlation-generation-001",
    },
  });

  expect(response.status()).toBe(503);
  expect(response.headers()["cache-control"]).toBe("no-store");
  await expect(response.json()).resolves.toMatchObject({
    error: { code: "SPEECH_PROVIDER_UNAVAILABLE" },
    meta: { correlationId: "correlation-generation-001" },
  });
});

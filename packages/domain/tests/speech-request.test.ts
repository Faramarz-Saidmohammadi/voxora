import { describe, expect, it } from "vitest";

import {
  AuthorizationError,
  prepareSpeechRequest,
  UsageLimitError,
} from "../src/index";

const baseInput = {
  requestId: "request-1",
  workspaceId: "workspace-1",
  actorId: "actor-1",
  role: "EDITOR" as const,
  idempotencyKey: "appointment-confirmed-1",
  text: "Your appointment is confirmed.",
  locale: "en-US",
  voice: "calm",
  format: "mp3" as const,
  usage: { limit: 1_000, consumed: 100, reserved: 0 },
};

describe("speech request preparation", () => {
  it("authorizes, counts, and reserves a queued request", () => {
    const result = prepareSpeechRequest(baseInput);

    expect(result.request).toMatchObject({
      id: "request-1",
      status: "QUEUED",
      characterCount: 30,
      workspaceId: "workspace-1",
    });
    expect(result.nextUsage.reserved).toBe(30);
  });

  it("rejects a viewer before reserving usage", () => {
    expect(() =>
      prepareSpeechRequest({ ...baseInput, role: "VIEWER" }),
    ).toThrow(AuthorizationError);
  });

  it("rejects work that exceeds the workspace budget", () => {
    expect(() =>
      prepareSpeechRequest({
        ...baseInput,
        usage: { limit: 10, consumed: 0, reserved: 0 },
      }),
    ).toThrow(UsageLimitError);
  });
});

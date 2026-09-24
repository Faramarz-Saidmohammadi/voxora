import { describe, expect, it } from "vitest";

import { speechGenerationSchema, speechRequestSchema } from "../src/index";

describe("speech request contract", () => {
  it("applies safe defaults to a valid request", () => {
    expect(
      speechRequestSchema.parse({ text: "Welcome", locale: "en-US" }),
    ).toEqual({
      text: "Welcome",
      locale: "en-US",
      voice: "calm",
      format: "mp3",
    });
  });

  it("rejects empty content and malformed locales", () => {
    expect(
      speechRequestSchema.safeParse({ text: " ", locale: "english" }).success,
    ).toBe(false);
  });
});

describe("speech generation contract", () => {
  it("uses an approved high-quality voice and a bounded payload", () => {
    expect(
      speechGenerationSchema.parse({ text: "Welcome", locale: "en-US" }),
    ).toEqual({
      text: "Welcome",
      locale: "en-US",
      voice: "cedar",
      format: "mp3",
    });
  });

  it("rejects unsupported voices and oversized instructions", () => {
    expect(
      speechGenerationSchema.safeParse({
        text: "Welcome",
        locale: "en-US",
        voice: "custom-unverified",
      }).success,
    ).toBe(false);

    expect(
      speechGenerationSchema.safeParse({
        text: "Welcome",
        locale: "en-US",
        instructions: "a".repeat(301),
      }).success,
    ).toBe(false);
  });
});

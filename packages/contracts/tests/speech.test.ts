import { describe, expect, it } from "vitest";

import { speechRequestSchema } from "../src/index";

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

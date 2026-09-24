import { describe, expect, it } from "vitest";

import { reserveUsage } from "../src/index";

describe("usage reservation", () => {
  const usage = { limit: 10_000, consumed: 6_000, reserved: 500 };

  it("reserves capacity without mutating the input", () => {
    const result = reserveUsage(usage, 1_000);

    expect(result).toMatchObject({
      accepted: true,
      remaining: 2_500,
      next: { reserved: 1_500 },
    });
    expect(usage.reserved).toBe(500);
  });

  it("rejects requests above the available limit", () => {
    expect(reserveUsage(usage, 3_501)).toEqual({
      accepted: false,
      reason: "LIMIT_EXCEEDED",
      remaining: 3_500,
    });
  });

  it.each([0, -1, 2.5, Number.NaN])("rejects invalid amount %s", (amount) => {
    expect(reserveUsage(usage, amount)).toMatchObject({
      accepted: false,
      reason: "INVALID_AMOUNT",
    });
  });
});

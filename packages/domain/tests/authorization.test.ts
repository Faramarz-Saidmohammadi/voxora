import { describe, expect, it } from "vitest";

import { can, requirePermission } from "../src/index";

describe("workspace authorization", () => {
  it("allows owners to perform owner-only actions", () => {
    expect(can("OWNER", "billing:manage")).toBe(true);
    expect(() => requirePermission("OWNER", "workspace:manage")).not.toThrow();
  });

  it("prevents editors from managing members", () => {
    expect(can("EDITOR", "members:manage")).toBe(false);
    expect(() => requirePermission("EDITOR", "members:manage")).toThrow(
      /does not have members:manage/,
    );
  });

  it("keeps viewers read-only", () => {
    expect(can("VIEWER", "phrase:read")).toBe(true);
    expect(can("VIEWER", "phrase:write")).toBe(false);
    expect(can("VIEWER", "speech:create")).toBe(false);
  });
});

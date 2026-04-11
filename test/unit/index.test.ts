import { describe, expect, it } from "vitest";

describe("index", () => {
  it("re-exports siteIndexPlugin", async () => {
    const index = await import("../../src/index.js");
    const plugin = await import("../../src/plugin.js");

    expect(index.siteIndexPlugin).toBe(plugin.siteIndexPlugin);
  });

  it("exports type shape at runtime boundary", async () => {
    const index = await import("../../src/index.js");

    expect("siteIndexPlugin" in index).toBe(true);
  });
});

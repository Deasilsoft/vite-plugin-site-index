import { describe, expect, it } from "vitest";
import { resolveConfig } from "./config.js";

describe("resolveConfig", () => {
  it("preserves url without trailing slash", () => {
    const result = resolveConfig({ siteUrl: "https://example.com" });

    expect(result.siteUrl).toBe("https://example.com");
  });

  it("removes trailing slash from url", () => {
    const result = resolveConfig({ siteUrl: "https://example.com/" });

    expect(result.siteUrl).toBe("https://example.com");
  });

  it("handles localhost with port and trailing slash", () => {
    const result = resolveConfig({ siteUrl: "http://localhost:3000/" });

    expect(result.siteUrl).toBe("http://localhost:3000");
  });
});

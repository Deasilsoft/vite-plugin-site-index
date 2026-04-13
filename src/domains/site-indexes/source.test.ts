import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSiteIndexesSource } from "./source.js";

const { loadRegistryMock } = vi.hoisted(() => ({
  loadRegistryMock: vi.fn(),
}));

vi.mock("./loader.js", () => ({
  loadRegistry: loadRegistryMock,
}));

describe("createSiteIndexesSource", () => {
  beforeEach(() => {
    loadRegistryMock.mockReset();
  });

  it("flattens siteIndexes from all loaded modules", async () => {
    loadRegistryMock.mockResolvedValueOnce({
      registry: {
        "./about.site-index.ts": { siteIndexes: [{ url: "/about" }] },
        "./blog.site-index.ts": { siteIndexes: [{ url: "/blog" }] },
      },
      warnings: [],
    });

    const source = createSiteIndexesSource();
    const result = await source.loadSiteIndexes();

    expect(result.siteIndexes).toEqual([{ url: "/about" }, { url: "/blog" }]);
    expect(result.warnings).toEqual([]);
  });

  it("throws when a module does not export siteIndexes", async () => {
    loadRegistryMock.mockResolvedValueOnce({
      registry: {
        "./bad.site-index.ts": {},
      },
      warnings: [],
    });

    const source = createSiteIndexesSource();

    await expect(source.loadSiteIndexes()).rejects.toThrow(
      "Module must export siteIndexes",
    );
  });
});

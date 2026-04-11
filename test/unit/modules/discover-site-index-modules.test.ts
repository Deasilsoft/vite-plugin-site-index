import { describe, expect, it, vi } from "vitest";
import { discoverSiteIndexModules } from "../../../src/modules/discover-site-index-modules.js";

const { fastGlobMock } = vi.hoisted(() => ({
  fastGlobMock: vi.fn(),
}));

vi.mock("fast-glob", () => ({
  default: fastGlobMock,
}));

describe("discoverSiteIndexModules", () => {
  it("passes include and exclude patterns to fast-glob", async () => {
    fastGlobMock.mockResolvedValueOnce([
      "/repo/src/pages/site-index.ts",
      "/repo/src/blog/post.site-index.ts",
    ]);

    const result = await discoverSiteIndexModules({
      siteUrl: "https://example.com",
      include: ["src/**/site-index.ts", "src/**/*.site-index.ts"],
      exclude: ["src/**/__tests__/**"],
      userAgent: "*",
    });

    expect(result).toEqual([
      "/repo/src/pages/site-index.ts",
      "/repo/src/blog/post.site-index.ts",
    ]);

    expect(fastGlobMock).toHaveBeenCalledWith(
      ["src/**/site-index.ts", "src/**/*.site-index.ts"],
      {
        ignore: ["src/**/__tests__/**"],
        absolute: true,
      },
    );
  });
});

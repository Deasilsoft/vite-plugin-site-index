import { validateSiteIndexes } from "../src/stages/validateSiteIndexes.js";
import type { ResolvedModule } from "../src/types.js";
import { describe, expect, it } from "vitest";

describe("validateSiteIndexes", () => {
  it("normalizes defaults, deduplicates by first-wins, and emits duplicate warnings", () => {
    const resolvedModules: ResolvedModule[] = [
      {
        module: {
          filePath: "/workspace/a.site-index.ts",
          importId: "./a.site-index.ts",
        },
        siteIndexes: [
          { url: "/about" },
          { url: "/z", sitemap: "blog", index: false },
        ],
      },
      {
        module: {
          filePath: "/workspace/b.site-index.ts",
          importId: "./b.site-index.ts",
        },
        siteIndexes: [{ url: "/about", sitemap: "blog" }, { url: "/a" }],
      },
    ];

    const result = validateSiteIndexes(resolvedModules);

    expect(result.data).toEqual([
      { url: "/z", sitemap: "blog", index: false },
      { url: "/a", sitemap: "pages", index: true },
      { url: "/about", sitemap: "pages", index: true },
    ]);
    expect(result.warnings).toEqual([
      {
        message:
          "Duplicate url ignored: /about (already defined in /workspace/a.site-index.ts)",
        filePath: "/workspace/b.site-index.ts",
      },
    ]);
  });
});

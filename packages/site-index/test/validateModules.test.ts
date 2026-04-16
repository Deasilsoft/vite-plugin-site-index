import { validateModules } from "../src/stages/validateModules.js";
import type { LoadedModule } from "../src/types.js";
import { describe, expect, it } from "vitest";

describe("validateModules", () => {
  it("resolves valid module exports", () => {
    const loadedModules: LoadedModule[] = [
      {
        module: {
          filePath: "/workspace/pages.site-index.ts",
          importId: "./pages.site-index.ts",
        },
        exports: {
          default: [
            {
              url: "/about",
            },
          ],
        },
      },
    ];

    const result = validateModules(loadedModules);

    expect(result).toEqual({
      data: [
        {
          module: {
            filePath: "/workspace/pages.site-index.ts",
            importId: "./pages.site-index.ts",
          },
          siteIndexes: [
            {
              url: "/about",
            },
          ],
        },
      ],
      warnings: [],
    });
  });

  it("warns and skips modules with invalid exports", () => {
    const loadedModules = [
      {
        module: {
          filePath: "/workspace/bad.site-index.ts",
          importId: "./bad.site-index.ts",
        },
        exports: {
          default: [
            {
              url: "about",
            },
          ],
        },
      },
    ] as unknown as LoadedModule[];

    const result = validateModules(loadedModules);

    expect(result.data).toEqual([]);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toMatchObject({
      filePath: "/workspace/bad.site-index.ts",
    });
    expect(result.warnings[0]?.message).toContain(
      "Invalid site index module exports",
    );
  });
});

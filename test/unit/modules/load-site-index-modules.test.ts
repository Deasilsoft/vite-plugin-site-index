import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadSiteIndexModule } from "../../../src/modules/load-site-index-module.js";

describe("loadSiteIndexModule", () => {
  it("loads an ESM module from a file path", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "site-index-module-"));
    const file = path.join(dir, "about.site-index.mjs");

    await fs.writeFile(
      file,
      [
        "export const siteIndex = {",
        '  url: "/about",',
        '  sitemap: "pages",',
        "  index: true",
        "};",
      ].join("\n"),
      "utf8",
    );

    const result = (await loadSiteIndexModule(file)) as {
      siteIndex: { url: string };
    };

    expect(result.siteIndex.url).toBe("/about");
  });
});

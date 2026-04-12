import { pipeline } from "@/plugin";
import { describe, expect, it } from "vitest";

describe("pipeline", () => {
  it("returns sitemap index and robots when no modules are discovered", async () => {
    const result = await pipeline({
      siteUrl: "https://example.com",
      include: ["does-not-exist/**/*.site-index.ts"],
      exclude: [],
      userAgent: "*",
    });

    expect(result).toEqual({
      artifacts: [
        {
          path: "/sitemap.xml",
          content:
            '<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"></sitemapindex>',
        },
        {
          path: "/robots.txt",
          content: "User-agent: *\nSitemap: https://example.com/sitemap.xml",
        },
      ],
      warnings: [],
    });
  });
});

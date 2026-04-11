import { describe, expect, it } from "vitest";
import { renderSitemapXml } from "../../../src/render/render-sitemap-xml.js";

describe("renderSitemapXml", () => {
  it("renders urls with lastmod when present", () => {
    const xml = renderSitemapXml(
      [
        {
          url: "/about",
          sitemap: "pages",
          index: true,
          lastModified: "2026-04-11T10:00:00.000Z",
        },
      ],
      "https://example.com",
    );

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain("<urlset");
    expect(xml).toContain("<loc>https://example.com/about</loc>");
    expect(xml).toContain("<lastmod>2026-04-11T10:00:00.000Z</lastmod>");
  });

  it("omits lastmod when absent", () => {
    const xml = renderSitemapXml(
      [{ url: "/blog", sitemap: "blog", index: true }],
      "https://example.com",
    );

    expect(xml).toContain("<loc>https://example.com/blog</loc>");
    expect(xml).not.toContain("<lastmod>");
  });
});

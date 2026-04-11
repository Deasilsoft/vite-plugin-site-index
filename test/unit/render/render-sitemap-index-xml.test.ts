import { describe, expect, it } from "vitest";
import { renderSitemapIndexXml } from "../../../src/render/render-sitemap-index-xml.js";

describe("renderSitemapIndexXml", () => {
  it("renders a sitemap index for all sitemap paths", () => {
    const xml = renderSitemapIndexXml(
      ["/sitemap-pages.xml", "/sitemap-blog.xml"],
      "https://example.com",
    );

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain("<sitemapindex");
    expect(xml).toContain("<loc>https://example.com/sitemap-pages.xml</loc>");
    expect(xml).toContain("<loc>https://example.com/sitemap-blog.xml</loc>");
  });
});

import { describe, expect, it } from "vitest";
import { renderSitemapIndexXml, renderSitemapXml } from "./sitemaps.js";

const SITE_URL = "https://example.com";

describe("renderSitemapXml", () => {
  it("renders escaped locations and escaped lastmod values", () => {
    const xml = renderSitemapXml(
      [
        {
          url: "/search?q=foo&bar=1",
          sitemap: "pages",
          index: true,
          lastModified: "2026-04-11T10:00:00.000Z&draft=false",
        },
      ],
      SITE_URL,
    );

    expect(xml).toContain(
      "<loc>https://example.com/search?q=foo&amp;bar=1</loc>",
    );
    expect(xml).toContain(
      "<lastmod>2026-04-11T10:00:00.000Z&amp;draft=false</lastmod>",
    );
  });

  it("omits lastmod when an entry has no lastModified", () => {
    const xml = renderSitemapXml(
      [{ url: "/blog", sitemap: "blog", index: true }],
      SITE_URL,
    );

    expect(xml).toContain("<loc>https://example.com/blog</loc>");
    expect(xml).not.toContain("<lastmod>");
  });
});

describe("renderSitemapIndexXml", () => {
  it("renders escaped absolute sitemap locations from normalized siteUrl", () => {
    const xml = renderSitemapIndexXml(
      ["/sitemap-pages.xml?x=1&y=2", "/sitemap-blog.xml"],
      `${SITE_URL}/`,
    );

    expect(xml).toContain(
      "<loc>https://example.com/sitemap-pages.xml?x=1&amp;y=2</loc>",
    );
    expect(xml).toContain("<loc>https://example.com/sitemap-blog.xml</loc>");
  });
});

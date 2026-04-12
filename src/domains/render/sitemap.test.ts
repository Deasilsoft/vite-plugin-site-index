import { renderSitemapXml } from "@/domains/render";
import { describe, expect, it } from "vitest";

describe("renderSitemapXml", () => {
  it("XML-escapes special characters in url", () => {
    const xml = renderSitemapXml(
      [
        {
          url: "/search?q=foo&bar=1",
          sitemap: "pages",
          index: true,
          lastModified: "2026-04-11T10:00:00.000Z",
        },
      ],
      "https://example.com",
    );

    expect(xml).toContain(
      "<loc>https://example.com/search?q=foo&amp;bar=1</loc>",
    );
  });

  it("omits lastmod when entry has no lastModified", () => {
    const xml = renderSitemapXml(
      [{ url: "/blog", sitemap: "blog", index: true }],
      "https://example.com",
    );

    expect(xml).toContain("<loc>https://example.com/blog</loc>");
    expect(xml).not.toContain("<lastmod>");
  });
});

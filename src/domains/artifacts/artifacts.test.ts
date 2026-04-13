import { describe, expect, it } from "vitest";
import { buildArtifacts } from "./artifacts.js";
import type { Artifact, ResolvedSiteIndex } from "./types.js";

const SITE_URL = "https://example.com";

function getArtifactContent(artifacts: Artifact[], path: string): string {
  const artifact = artifacts.find((item) => item.path === path);

  if (!artifact) {
    throw new Error(`Expected artifact not found: ${path}`);
  }

  return artifact.content;
}

describe("buildArtifacts", () => {
  it("builds sitemap artifacts, index artifact, and robots artifact with stable ordering", () => {
    const siteIndexes: ResolvedSiteIndex[] = [
      { url: "/private", sitemap: "pages", index: false },
      { url: "/blog/first", sitemap: "blog", index: true },
      { url: "/about", sitemap: "pages", index: true },
      { url: "/admin", sitemap: "pages", index: false },
    ];

    const artifacts = buildArtifacts(siteIndexes, SITE_URL);

    expect(artifacts.map((artifact) => artifact.path)).toEqual([
      "/sitemap-blog.xml",
      "/sitemap-pages.xml",
      "/sitemap.xml",
      "/robots.txt",
    ]);

    const sitemapBlog = getArtifactContent(artifacts, "/sitemap-blog.xml");
    const sitemapPages = getArtifactContent(artifacts, "/sitemap-pages.xml");
    const sitemapIndex = getArtifactContent(artifacts, "/sitemap.xml");
    const robots = getArtifactContent(artifacts, "/robots.txt");

    expect(sitemapBlog).toContain("<loc>https://example.com/blog/first</loc>");
    expect(sitemapPages).toContain("<loc>https://example.com/about</loc>");
    expect(sitemapPages).not.toContain("/private");
    expect(sitemapIndex).toContain("/sitemap-blog.xml");
    expect(sitemapIndex).toContain("/sitemap-pages.xml");
    expect(robots).toContain("Disallow: /admin");
    expect(robots).toContain("Disallow: /private");
  });
});

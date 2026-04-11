import { describe, expect, it } from "vitest";
import { renderRobotsTxt } from "../../../src/render/render-robots-txt.js";

describe("renderRobotsTxt", () => {
  it("renders user-agent, sitemap, and disallow lines", () => {
    const robotsTxt = renderRobotsTxt({
      siteUrl: "https://example.com",
      userAgent: "*",
      disallowed: ["/private", "/drafts"],
    });

    expect(robotsTxt).toBe(
      [
        "User-agent: *",
        "Sitemap: https://example.com/sitemap.xml",
        "Disallow: /private",
        "Disallow: /drafts",
      ].join("\n"),
    );
  });

  it("renders without disallow lines when none exist", () => {
    const robotsTxt = renderRobotsTxt({
      siteUrl: "https://example.com",
      userAgent: "Googlebot",
      disallowed: [],
    });

    expect(robotsTxt).toBe(
      [
        "User-agent: Googlebot",
        "Sitemap: https://example.com/sitemap.xml",
      ].join("\n"),
    );
  });
});

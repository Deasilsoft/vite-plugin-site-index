import { describe, expect, it } from "vitest";
import { renderRobotsTxt } from "./robots.js";

const SITE_URL = "https://example.com";

describe("renderRobotsTxt", () => {
  it("renders a deterministic robots.txt layout", () => {
    const txt = renderRobotsTxt(`${SITE_URL}/`, ["/admin", "/private"]);

    expect(txt).toBe(
      [
        "User-agent: *",
        "Sitemap: https://example.com/sitemap.xml",
        "Disallow: /admin",
        "Disallow: /private",
      ].join("\n"),
    );
  });
});

import { describe, expect, it } from "vitest";
import { validateSitemapName } from "../../../src/validate/validate-sitemap-name.js";

describe("validateSitemapName", () => {
  it("accepts valid sitemap names", () => {
    expect(() => validateSitemapName("pages")).not.toThrow();
    expect(() => validateSitemapName("blog-posts")).not.toThrow();
    expect(() => validateSitemapName("docs-v2")).not.toThrow();
  });

  it("rejects uppercase names", () => {
    expect(() => validateSitemapName("Pages")).toThrow(
      "Invalid sitemap name: Pages",
    );
  });

  it("rejects names with underscores", () => {
    expect(() => validateSitemapName("blog_posts")).toThrow(
      "Invalid sitemap name: blog_posts",
    );
  });

  it("rejects names with leading dashes", () => {
    expect(() => validateSitemapName("-pages")).toThrow(
      "Invalid sitemap name: -pages",
    );
  });

  it("rejects names with trailing dashes", () => {
    expect(() => validateSitemapName("pages-")).toThrow(
      "Invalid sitemap name: pages-",
    );
  });
});

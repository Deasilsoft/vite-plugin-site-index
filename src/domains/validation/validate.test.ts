import {
  validateEntryUrl,
  validateResolvedEntries,
  validateSitemapName,
} from "@/domains/validation";
import { describe, expect, it } from "vitest";

describe("validateEntryUrl edge cases", () => {
  it.each([
    ["about", "Invalid url: about"],
    ["/about?x=1", "Invalid url (no query/fragment): /about?x=1"],
    ["/about#team", "Invalid url (no query/fragment): /about#team"],
  ])("rejects %s", (value, expectedMessage) => {
    expect(() => validateEntryUrl(value as `/${string}`)).toThrow(
      expectedMessage,
    );
  });
});

describe("validateResolvedEntries edge cases", () => {
  it("rejects duplicate urls", () => {
    expect(() =>
      validateResolvedEntries([
        { url: "/about", sitemap: "pages", index: true },
        { url: "/about", sitemap: "blog", index: true },
      ]),
    ).toThrow("Duplicate url: /about");
  });
});

describe("validateSitemapName edge cases", () => {
  it.each(["Pages", "blog_posts", "-pages", "pages-"])("rejects %s", (name) => {
    expect(() => validateSitemapName(name)).toThrow(
      `Invalid sitemap name: ${name}`,
    );
  });
});

import { describe, expect, it } from "vitest";
import { validateResolvedEntries } from "../../../src/validate/validate-resolved-entries.js";

describe("validateResolvedEntries", () => {
  it("accepts unique urls", () => {
    expect(() =>
      validateResolvedEntries([
        { url: "/about", sitemap: "pages", index: true },
        { url: "/blog", sitemap: "blog", index: true },
      ]),
    ).not.toThrow();
  });

  it("rejects duplicate urls", () => {
    expect(() =>
      validateResolvedEntries([
        { url: "/about", sitemap: "pages", index: true },
        { url: "/about", sitemap: "blog", index: true },
      ]),
    ).toThrow("Duplicate url: /about");
  });
});

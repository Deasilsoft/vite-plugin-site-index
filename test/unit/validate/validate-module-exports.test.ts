import { describe, expect, it } from "vitest";
import { validateModuleExports } from "../../../src/validate/validate-module-exports.js";

describe("validateModuleExports", () => {
  it("accepts a module with siteIndex", () => {
    expect(() =>
      validateModuleExports({
        siteIndex: { url: "/about" },
      }),
    ).not.toThrow();
  });

  it("accepts a module with siteIndexes", () => {
    expect(() =>
      validateModuleExports({
        siteIndexes: [{ url: "/about" }],
      }),
    ).not.toThrow();
  });

  it("rejects a module with both siteIndex and siteIndexes", () => {
    expect(() =>
      validateModuleExports({
        siteIndex: { url: "/about" },
        siteIndexes: [{ url: "/blog" }],
      }),
    ).toThrow("Module cannot export both siteIndex and siteIndexes");
  });

  it("rejects a module with neither siteIndex nor siteIndexes", () => {
    expect(() => validateModuleExports({})).toThrow(
      "Module must export siteIndex or siteIndexes",
    );
  });
});

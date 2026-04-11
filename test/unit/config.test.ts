import { describe, expect, it } from "vitest";
import { normalizeConfig } from "../../src/config.js";

describe("normalizeConfig", () => {
  it("strips trailing slash from siteUrl", () => {
    expect(
      normalizeConfig({
        siteUrl: "https://example.com/",
      }),
    ).toEqual({
      siteUrl: "https://example.com",
      include: ["src/**/site-index.ts", "src/**/*.site-index.ts"],
      exclude: [],
      userAgent: "*",
    });
  });

  it("uses defaults for include, exclude, and userAgent", () => {
    expect(
      normalizeConfig({
        siteUrl: "https://example.com",
      }),
    ).toEqual({
      siteUrl: "https://example.com",
      include: ["src/**/site-index.ts", "src/**/*.site-index.ts"],
      exclude: [],
      userAgent: "*",
    });
  });

  it("normalizes string include and exclude values into arrays", () => {
    expect(
      normalizeConfig({
        siteUrl: "https://example.com",
        include: "src/custom/**/*.ts",
        exclude: "src/ignored/**/*.ts",
        userAgent: "Googlebot",
      }),
    ).toEqual({
      siteUrl: "https://example.com",
      include: ["src/custom/**/*.ts"],
      exclude: ["src/ignored/**/*.ts"],
      userAgent: "Googlebot",
    });
  });

  it("keeps include and exclude arrays as-is", () => {
    expect(
      normalizeConfig({
        siteUrl: "https://example.com",
        include: ["src/a.ts", "src/b.ts"],
        exclude: ["src/c.ts"],
        userAgent: "Bingbot",
      }),
    ).toEqual({
      siteUrl: "https://example.com",
      include: ["src/a.ts", "src/b.ts"],
      exclude: ["src/c.ts"],
      userAgent: "Bingbot",
    });
  });
});

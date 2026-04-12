import type { Config } from "@/shared/types.js";
import path from "node:path";

type FixtureAppScenario = {
  name: string;
  fixtureRoot: string;
  pluginOptions: Config;
  mockedLastModifiedByFile: Array<[string, string]>;
  expectedAssets: Array<{
    fileName: string;
    expectedFile: string;
  }>;
};

const fixtureRoot = path.resolve("example");

export const exampleScenario: FixtureAppScenario = {
  name: "app fixture generates sitemap and robots artifacts",
  fixtureRoot,
  pluginOptions: {
    siteUrl: "https://example.com/",
  },
  mockedLastModifiedByFile: [
    [
      path.resolve(fixtureRoot, "src/about.site-index.ts"),
      "2026-04-09T08:00:00.000Z",
    ],
  ],
  expectedAssets: [
    {
      fileName: "sitemap-pages.xml",
      expectedFile: "expected/sitemap-pages.xml",
    },
    {
      fileName: "sitemap-blog.xml",
      expectedFile: "expected/sitemap-blog.xml",
    },
    {
      fileName: "sitemap.xml",
      expectedFile: "expected/sitemap.xml",
    },
    {
      fileName: "robots.txt",
      expectedFile: "expected/robots.txt",
    },
  ],
};

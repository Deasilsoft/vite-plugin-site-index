import path from "node:path";
import type { Scenario } from "@examples/types";

export const tsDistScenario: Scenario = {
  name: "ts-dist",
  root: path.resolve("examples/ts-dist"),
  pluginOptions: {
    siteUrl: "https://example.com/",
  },
  expectedFiles: [
    "sitemap-pages.xml",
    "sitemap-blog.xml",
    "sitemap.xml",
    "robots.txt",
  ],
};

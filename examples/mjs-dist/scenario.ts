import path from "node:path";
import type { Scenario } from "@examples/types";

export const mjsScenario: Scenario = {
  name: "mjs-dist",
  root: path.resolve("examples/mjs-dist"),
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

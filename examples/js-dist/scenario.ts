import path from "node:path";
import type { Scenario } from "@examples/types";

export const jsScenario: Scenario = {
  name: "js-dist",
  root: path.resolve("examples/js-dist"),
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

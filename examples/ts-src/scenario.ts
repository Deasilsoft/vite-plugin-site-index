import path from "node:path";
import type { Scenario } from "@examples/types";

export const tsSrcScenario: Scenario = {
  name: "ts-src",
  root: path.resolve("examples/ts-src"),
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

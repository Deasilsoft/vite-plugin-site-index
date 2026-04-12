import { normalizeConfig, pipeline } from "@/plugin";
import type { Config } from "@/shared/types.js";
import type { Plugin } from "vite";

export function siteIndexPlugin(options: Config): Plugin {
  const config = normalizeConfig(options);

  let artifacts: { path: string; content: string }[] = [];

  return {
    name: "vite-plugin-site-index",

    async buildStart() {
      const result = await pipeline(config);

      artifacts = result.artifacts;

      for (const warning of result.warnings) {
        this.warn(warning);
      }
    },

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();

        const match = artifacts.find((a) => a.path === req.url);

        if (!match) return next();

        res.setHeader(
          "Content-Type",
          match.path.endsWith(".xml") ? "application/xml" : "text/plain",
        );

        res.end(match.content);
      });
    },

    generateBundle() {
      for (const artifact of artifacts) {
        this.emitFile({
          type: "asset",
          fileName: artifact.path.replace(/^\//, ""),
          source: artifact.content,
        });
      }
    },
  };
}

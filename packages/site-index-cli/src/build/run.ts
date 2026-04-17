import path from "node:path";
import { runSiteIndexPipeline } from "site-index";
import { createServer, type InlineConfig } from "vite";
import { makeViteModuleLoader } from "../loader/vite.js";
import { logWarnings } from "../logger/warnings.js";
import type { BuildCommandOptions } from "../types.js";
import { writeArtifacts } from "./artifacts.js";

export async function runBuild(options: BuildCommandOptions): Promise<void> {
  const root = path.resolve(options.root);
  const outDir = path.resolve(root, options.outDir);
  const serverConfig: InlineConfig = {
    root,
    appType: "custom",
    server: {
      middlewareMode: true,
    },
  };

  if (options.config !== undefined) {
    serverConfig.configFile = options.config;
  }

  if (options.mode !== undefined) {
    serverConfig.mode = options.mode;
  }

  const viteServer = await createServer(serverConfig);

  try {
    const result = await runSiteIndexPipeline({
      siteUrl: options.siteUrl,
      discoveryRoot: root,
      loadDiscoveredModules: makeViteModuleLoader((id) =>
        viteServer.ssrLoadModule(id),
      ),
    });

    logWarnings(result.warnings);

    await writeArtifacts(outDir, result.data);
  } finally {
    await viteServer.close();
  }
}

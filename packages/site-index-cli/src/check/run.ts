import path from "node:path";
import { runSiteIndexPipeline } from "site-index";
import { createServer, type InlineConfig } from "vite";
import { makeViteModuleLoader } from "../loader/vite.js";
import { logWarnings } from "../logger/warnings.js";
import type { CheckCommandOptions } from "../types.js";

export async function runCheck(options: CheckCommandOptions): Promise<void> {
  const root = path.resolve(options.root);
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

    if (result.warnings.length > 0) {
      logWarnings(result.warnings);
      throw new Error(
        `Check failed with ${result.warnings.length} warning(s).`,
      );
    }
  } finally {
    await viteServer.close();
  }
}

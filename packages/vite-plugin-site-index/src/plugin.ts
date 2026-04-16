import {
  runSiteIndexPipeline,
  type Artifact,
  type LoadedModule,
  type Module,
  type Warning,
} from "site-index";
import {
  createServer,
  type InlineConfig,
  type Plugin,
  type ResolvedConfig,
  type ViteDevServer,
} from "vite";
import type { ArtifactsRef } from "./dev/types.js";
import { createViteDevProvisioner } from "./provision/vite-dev.js";
import type { Config } from "./types.js";

export const SITE_INDEX_PLUGIN_MARKER = "__vitePluginSiteIndex";

export function siteIndexPlugin(config: Config): Plugin {
  const artifactsRef: ArtifactsRef = {
    artifacts: null,
  };

  let command: ResolvedConfig["command"] = "build";
  let resolvedViteConfig: ResolvedConfig | undefined;

  function sortArtifacts(artifacts: Artifact[]): Artifact[] {
    return [...artifacts].sort((a, b) => a.filePath.localeCompare(b.filePath));
  }

  function makeModuleLoader(ssrLoadModule: (id: string) => Promise<unknown>) {
    return async (modules: Module[]) => {
      const data: LoadedModule[] = [];
      const warnings: Warning[] = [];

      for (const module of modules) {
        try {
          const exports = (await ssrLoadModule(
            module.importId,
          )) as LoadedModule["exports"];

          data.push({
            module,
            exports,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);

          warnings.push({
            message: `Failed to load module: ${message}`,
            filePath: module.filePath,
          });
        }
      }

      return { data, warnings };
    };
  }

  async function refreshFromViteServer(server: ViteDevServer): Promise<void> {
    const result = await runSiteIndexPipeline({
      siteUrl: config.siteUrl,
      discoveryRoot: server.config.root,
      loadDiscoveredModules: makeModuleLoader((id) => server.ssrLoadModule(id)),
    });

    artifactsRef.artifacts = sortArtifacts(result.data);

    for (const warning of result.warnings) {
      server.config.logger.warn(`[vite-plugin-site-index] ${warning.message}`);
    }
  }

  const plugin: Plugin = {
    name: "vite-plugin-site-index",
    configResolved(resolvedConfig) {
      command = resolvedConfig.command;
      resolvedViteConfig = resolvedConfig;
    },
    async buildStart() {
      if (command === "serve") {
        return;
      }

      const root = resolvedViteConfig?.root ?? process.cwd();
      const mode = resolvedViteConfig?.mode;
      const configFile = resolvedViteConfig?.configFile;
      const serverConfig: InlineConfig = {
        root,
        appType: "custom",
        server: {
          middlewareMode: true,
        },
      };

      if (mode !== undefined) {
        serverConfig.mode = mode;
      }

      if (configFile !== undefined) {
        serverConfig.configFile = configFile;
      }

      const viteServer = await createServer(serverConfig);

      try {
        const result = await runSiteIndexPipeline({
          siteUrl: config.siteUrl,
          discoveryRoot: root,
          loadDiscoveredModules: makeModuleLoader((id) =>
            viteServer.ssrLoadModule(id),
          ),
        });

        artifactsRef.artifacts = sortArtifacts(result.data);

        for (const warning of result.warnings) {
          this.warn(warning.message);
        }
      } finally {
        await viteServer.close();
      }
    },
    configureServer(server) {
      createViteDevProvisioner({
        server,
        artifactsRef,
        refresh: refreshFromViteServer,
      });
    },
    generateBundle() {
      const artifacts = artifactsRef.artifacts;
      if (!artifacts) return;

      for (const artifact of artifacts) {
        this.emitFile({
          type: "asset",
          fileName: artifact.filePath.replace(/^\//, ""),
          source: artifact.content,
        });
      }
    },
  };

  (
    plugin as unknown as {
      [SITE_INDEX_PLUGIN_MARKER]: unknown;
    }
  )[SITE_INDEX_PLUGIN_MARKER] = {
    options: config,
  };

  return plugin;
}

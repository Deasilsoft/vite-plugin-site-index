import type { LoadedModule, Module, Options, Warning } from "site-index";

export function makeViteModuleLoader(
  ssrLoadModule: (id: string) => Promise<unknown>,
): Options["loadDiscoveredModules"] {
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
        const message = error instanceof Error ? error.message : String(error);

        warnings.push({
          message: `Failed to load module: ${message}`,
          filePath: module.filePath,
        });
      }
    }

    return { data, warnings };
  };
}

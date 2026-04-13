import type {
  SiteIndexesSource,
  SiteIndexesSourceResult,
} from "@/domains/pipeline/types.js";
import type { ModuleLoaderContext } from "./context.js";
import { loadRegistry } from "./loader.js";
import type { EntryModule, SiteIndexes } from "./types.js";

function extractSiteIndexes(module: EntryModule): SiteIndexes {
  if (!module || typeof module !== "object" || !module.siteIndexes) {
    throw new Error("Module must export siteIndexes");
  }

  return module.siteIndexes;
}

export function createSiteIndexesSource(
  context?: ModuleLoaderContext,
): SiteIndexesSource {
  return {
    async loadSiteIndexes(): Promise<SiteIndexesSourceResult> {
      const registry = await loadRegistry(context);
      const siteIndexes: SiteIndexes = [];

      for (const [, module] of Object.entries(registry.registry)) {
        siteIndexes.push(...extractSiteIndexes(module));
      }

      return { siteIndexes, warnings: registry.warnings };
    },
  };
}

import { discoverAllModules } from "./stages/discover.js";
import { makeArtifacts } from "./stages/generate.js";
import { validateModules } from "./stages/validateModules.js";
import { validateOptions } from "./stages/validateOptions.js";
import { validateSiteIndexes } from "./stages/validateSiteIndexes.js";
import type { Artifact, DataWithWarnings, Options } from "./types.js";

export async function runSiteIndexPipeline(
  options: Options,
): Promise<DataWithWarnings<Artifact[]>> {
  const config = validateOptions(options);
  const modules = await discoverAllModules(config.discoveryRoot);

  if (modules.length === 0) {
    return {
      data: [],
      warnings: [
        {
          message: `No modules found in: ${config.discoveryRoot}`,
        },
      ],
    };
  }

  const loadedModules = await config.loadDiscoveredModules(modules);
  const validatedModules = validateModules(loadedModules.data);
  const validatedSiteIndexes = validateSiteIndexes(validatedModules.data);

  return {
    data: makeArtifacts(config.siteUrl, validatedSiteIndexes.data),
    warnings: [
      ...loadedModules.warnings,
      ...validatedModules.warnings,
      ...validatedSiteIndexes.warnings,
    ],
  };
}

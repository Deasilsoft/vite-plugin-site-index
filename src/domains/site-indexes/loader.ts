import path from "node:path";
import { normalizePath } from "vite";
import {
  type ModuleLoaderContext,
  resolveModuleLoaderContext,
} from "./context.js";
import { findSiteIndexFiles } from "./discovery.js";
import { resolveModule } from "./resolver.js";
import type { Registry, RegistryLoadResult } from "./types.js";

async function buildRegistry(
  files: string[],
  context: ModuleLoaderContext,
): Promise<Registry> {
  const registry: Registry = {};

  for (const file of files) {
    const key = `./${normalizePath(path.relative(context.root, file))}`;

    registry[key] = await resolveModule(file, (id) =>
      context.ssrLoadModule(id),
    );
  }

  return registry;
}

export async function loadRegistry(
  context?: ModuleLoaderContext,
): Promise<RegistryLoadResult> {
  const warnings: string[] = [];
  const { moduleLoaderContext, dispose } =
    await resolveModuleLoaderContext(context);

  try {
    const files = await findSiteIndexFiles(moduleLoaderContext.root);

    if (files.length === 0) {
      warnings.push(
        `No site-index modules found under Vite root: ${normalizePath(moduleLoaderContext.root)}`,
      );
    }

    const registry = await buildRegistry(files, moduleLoaderContext);

    return { registry, warnings };
  } finally {
    await dispose();
  }
}

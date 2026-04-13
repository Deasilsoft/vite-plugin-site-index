import { normalizePath } from "vite";
import type { EntryModule } from "./types.js";

function normalizeModule(loaded: unknown): EntryModule {
  if (!loaded || typeof loaded !== "object") {
    throw new Error("Module must export siteIndexes");
  }

  const module = loaded as Partial<EntryModule> & { default?: unknown };

  if (module.siteIndexes) {
    return module as EntryModule;
  }

  if (module.default && typeof module.default === "object") {
    const defaultModule = module.default as Partial<EntryModule>;

    if (defaultModule.siteIndexes) {
      return defaultModule as EntryModule;
    }
  }

  return module as EntryModule;
}

export async function resolveModule(
  file: string,
  loadWithVite: (id: string) => Promise<unknown>,
): Promise<EntryModule> {
  const loaded = await loadWithVite(normalizePath(file));

  return normalizeModule(loaded);
}

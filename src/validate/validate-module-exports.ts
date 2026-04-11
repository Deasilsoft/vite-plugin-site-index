export function validateModuleExports(mod: unknown): void {
  const m = mod as {
    siteIndex?: unknown;
    siteIndexes?: unknown;
  };

  if (m.siteIndex && m.siteIndexes) {
    throw new Error("Module cannot export both siteIndex and siteIndexes");
  }

  if (!m.siteIndex && !m.siteIndexes) {
    throw new Error("Module must export siteIndex or siteIndexes");
  }
}

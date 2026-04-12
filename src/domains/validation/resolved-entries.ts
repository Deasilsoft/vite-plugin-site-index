import type { ResultSiteIndex } from "@/shared/types.js";

export function validateResolvedEntries(entries: ResultSiteIndex[]): void {
  const seen = new Set<string>();

  for (const entry of entries) {
    if (seen.has(entry.url)) {
      throw new Error(`Duplicate url: ${entry.url}`);
    }

    seen.add(entry.url);
  }
}

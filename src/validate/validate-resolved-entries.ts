import type { ResolvedEntry } from "../pipeline/types.js";

export function validateResolvedEntries(entries: ResolvedEntry[]): void {
  const seen = new Set<string>();

  for (const entry of entries) {
    if (seen.has(entry.url)) {
      throw new Error(`Duplicate url: ${entry.url}`);
    }
    seen.add(entry.url);
  }
}

import fg from "fast-glob";
import type { NormalizedConfig } from "../config.js";

export async function discoverSiteIndexModules(
  config: NormalizedConfig,
): Promise<string[]> {
  return fg(config.include, {
    ignore: config.exclude,
    absolute: true,
  });
}

import { normalizeUrl } from "@/shared/utils.js";
import type { Config, Options } from "./types.js";

export function resolveConfig(options: Options): Config {
  return {
    siteUrl: normalizeUrl(options.siteUrl),
  };
}

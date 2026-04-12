import type { Config, ResolvedConfig } from "@/shared/types.js";
import { normalizeUrl } from "@/shared/utils.js";

export function normalizeConfig(options: Config): ResolvedConfig {
  return {
    siteUrl: normalizeUrl(options.siteUrl),
    include: options.include ?? [
      "src/**/site-index.ts",
      "src/**/*.site-index.ts",
    ],
    exclude: options.exclude ?? [],
    userAgent: options.userAgent ?? "*",
  };
}

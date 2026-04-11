import type { SiteIndexPluginOptions } from "./types.js";

export type NormalizedConfig = {
  siteUrl: string;
  include: string[];
  exclude: string[];
  userAgent: string;
};

export function normalizeConfig(
  options: SiteIndexPluginOptions,
): NormalizedConfig {
  return {
    siteUrl: trimTrailingSlashes(options.siteUrl),
    include: normalizeArray(options.include, [
      "src/**/site-index.ts",
      "src/**/*.site-index.ts",
    ]),
    exclude: normalizeArray(options.exclude, []),
    userAgent: options.userAgent ?? "*",
  };
}

function normalizeArray(
  value: string | string[] | undefined,
  fallback: string[],
): string[] {
  if (!value) return fallback;
  return Array.isArray(value) ? value : [value];
}

function trimTrailingSlashes(url: string): string {
  let end = url.length;
  while (end > 0 && url[end - 1] === "/") end--;
  return url.slice(0, end);
}

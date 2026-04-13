import type { ResolvedSiteIndex } from "@/domains/artifacts";
import type { SiteIndex, SiteIndexes } from "@/domains/site-indexes";

function resolveSiteIndex(siteIndex: SiteIndex): ResolvedSiteIndex {
  return {
    url: siteIndex.url,
    sitemap: siteIndex.sitemap ?? "pages",
    index: siteIndex.index ?? true,
    ...(siteIndex.lastModified ? { lastModified: siteIndex.lastModified } : {}),
  };
}

function compareResolvedSiteIndexes(
  a: ResolvedSiteIndex,
  b: ResolvedSiteIndex,
): number {
  return a.sitemap.localeCompare(b.sitemap) || a.url.localeCompare(b.url);
}

export function resolveSiteIndexes(
  siteIndexes: SiteIndexes,
): ResolvedSiteIndex[] {
  return siteIndexes.map(resolveSiteIndex).sort(compareResolvedSiteIndexes);
}

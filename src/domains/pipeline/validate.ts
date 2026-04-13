import type { ResolvedSiteIndex } from "@/domains/artifacts";

const SITEMAP_NAME_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function assertValidSiteIndexURL(url: string): void {
  if (!url.startsWith("/")) {
    throw new Error(`Invalid url: ${url}`);
  }

  if (url.includes("?") || url.includes("#")) {
    throw new Error(`Invalid url (no query/fragment): ${url}`);
  }
}

export function assertValidSitemapName(name: string): void {
  if (!SITEMAP_NAME_REGEX.test(name)) {
    throw new Error(`Invalid sitemap name: ${name}`);
  }
}

export function assertNoDuplicateURLs(siteIndexes: ResolvedSiteIndex[]): void {
  const seen = new Set<string>();

  for (const siteIndex of siteIndexes) {
    if (seen.has(siteIndex.url)) {
      throw new Error(`Duplicate url: ${siteIndex.url}`);
    }

    seen.add(siteIndex.url);
  }
}

export function assertValidSiteIndexes(siteIndexes: ResolvedSiteIndex[]): void {
  siteIndexes.forEach((siteIndex) => {
    assertValidSiteIndexURL(siteIndex.url);
    assertValidSitemapName(siteIndex.sitemap);
  });

  assertNoDuplicateURLs(siteIndexes);
}

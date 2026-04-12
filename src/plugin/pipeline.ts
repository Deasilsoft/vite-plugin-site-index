import type { ResolvedConfig } from "@/shared/types.js";
import { git } from "@/domains/git";
import { discoverModules, loadModules } from "@/domains/modules";
import {
  renderRobotsTxt,
  renderSitemapIndexXml,
  renderSitemapXml,
} from "@/domains/render";
import type {
  ResolvedSiteIndex,
  Result,
  ResultItem,
  ResultSiteIndex,
  SiteIndex,
} from "@/shared/types.js";

import {
  validateEntryUrl,
  validateResolvedEntries,
  validateSitemapName,
} from "@/domains/validation";

type RawEntryWithSource = SiteIndex & { sourceFile: string };

export async function pipeline(config: ResolvedConfig): Promise<Result> {
  const warnings: string[] = [];
  const moduleFiles = await discoverModules(config);
  const rawEntriesWithSource = await loadRawEntries(moduleFiles);
  const collectedEntries = normalizeEntries(rawEntriesWithSource);

  collectedEntries.forEach((entry) => {
    validateEntryUrl(entry.url);
    validateSitemapName(entry.sitemap);
  });

  const sourceFiles = Array.from(
    new Set(collectedEntries.map((entry) => entry.sourceFile)),
  );

  const lastModifiedMap = await git(sourceFiles, warnings);
  const resultEntries = collectedEntries.map((entry) =>
    createResolvedEntry(
      entry,
      entry.lastModified ?? lastModifiedMap.get(entry.sourceFile),
    ),
  );

  validateResolvedEntries(resultEntries);

  const artifacts = renderArtifacts(resultEntries, config);

  return { artifacts, warnings };
}

async function loadRawEntries(
  moduleFiles: string[],
): Promise<RawEntryWithSource[]> {
  const result: RawEntryWithSource[] = [];

  for (const file of moduleFiles) {
    const mod = await loadModules(file);
    const entries = extractEntries(mod);

    for (const entry of entries) {
      result.push({ ...entry, sourceFile: file });
    }
  }

  return result;
}

function extractEntries(mod: unknown): SiteIndex[] {
  const moduleExports = mod as {
    siteIndex?: SiteIndex;
    siteIndexes?: SiteIndex[];
  };

  if (moduleExports.siteIndex && moduleExports.siteIndexes) {
    throw new Error("Module cannot export both siteIndex and siteIndexes");
  }

  if (moduleExports.siteIndex) return [moduleExports.siteIndex];
  if (moduleExports.siteIndexes) return moduleExports.siteIndexes;

  throw new Error("Module must export siteIndex or siteIndexes");
}

function normalizeEntries(entries: RawEntryWithSource[]): ResolvedSiteIndex[] {
  return entries.map((entry) => createCollectedEntry(entry));
}

function createCollectedEntry(entry: RawEntryWithSource): ResolvedSiteIndex {
  return {
    url: entry.url,
    sitemap: entry.sitemap ?? "pages",
    index: entry.index ?? true,
    sourceFile: entry.sourceFile,
    ...(entry.lastModified ? { lastModified: entry.lastModified } : {}),
  };
}

function createResolvedEntry(
  entry: ResolvedSiteIndex,
  lastModified: string | undefined,
): ResultSiteIndex {
  return {
    url: entry.url,
    sitemap: entry.sitemap,
    index: entry.index,
    ...(lastModified ? { lastModified } : {}),
  };
}

function renderArtifacts(
  entries: ResultSiteIndex[],
  config: ResolvedConfig,
): ResultItem[] {
  const entriesBySitemap = new Map<string, ResultSiteIndex[]>();

  for (const entry of entries) {
    if (!entry.index) continue;

    const sitemapEntries = entriesBySitemap.get(entry.sitemap);

    if (sitemapEntries) {
      sitemapEntries.push(entry);

      continue;
    }

    entriesBySitemap.set(entry.sitemap, [entry]);
  }

  const artifacts: ResultItem[] = [];
  const sitemapPaths: string[] = [];

  for (const [name, sitemapEntries] of entriesBySitemap.entries()) {
    const path = `/sitemap-${name}.xml`;

    sitemapPaths.push(path);

    artifacts.push({
      path,
      content: renderSitemapXml(sitemapEntries, config.siteUrl),
    });
  }

  artifacts.push({
    path: "/sitemap.xml",
    content: renderSitemapIndexXml(sitemapPaths, config.siteUrl),
  });

  const disallowed = entries
    .filter((entry) => !entry.index)
    .map((entry) => entry.url);

  artifacts.push({
    path: "/robots.txt",
    content: renderRobotsTxt({
      siteUrl: config.siteUrl,
      userAgent: config.userAgent,
      disallowed,
    }),
  });

  return artifacts;
}

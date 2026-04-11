import type { NormalizedConfig } from "../config.js";
import { getLastModifiedMap } from "../git/get-last-modified-map.js";
import { discoverSiteIndexModules } from "../modules/discover-site-index-modules.js";
import { loadSiteIndexModule } from "../modules/load-site-index-module.js";
import { renderRobotsTxt } from "../render/render-robots-txt.js";
import { renderSitemapIndexXml } from "../render/render-sitemap-index-xml.js";
import { renderSitemapXml } from "../render/render-sitemap-xml.js";
import { validateEntryUrl } from "../validate/validate-entry-url.js";
import { validateResolvedEntries } from "../validate/validate-resolved-entries.js";
import { validateSitemapName } from "../validate/validate-sitemap-name.js";
import type {
  CollectedEntry,
  GeneratedArtifact,
  GenerateSiteArtifactsResult,
  RawEntry,
  ResolvedEntry,
} from "./types.js";

type RawEntryWithSource = RawEntry & { sourceFile: string };

export async function generateSiteArtifacts(
  config: NormalizedConfig,
): Promise<GenerateSiteArtifactsResult> {
  const warnings: string[] = [];

  const moduleFiles = await discoverSiteIndexModules(config);
  const rawEntriesWithSource = await loadRawEntries(moduleFiles);
  const collectedEntries = normalizeEntries(rawEntriesWithSource);

  collectedEntries.forEach((entry) => {
    validateEntryUrl(entry.url);
    validateSitemapName(entry.sitemap);
  });

  const sourceFiles = Array.from(
    new Set(collectedEntries.map((entry) => entry.sourceFile)),
  );

  const lastModifiedMap = await getLastModifiedMap(sourceFiles, warnings);
  const resolvedEntries = collectedEntries.map((entry) =>
    createResolvedEntry(
      entry,
      entry.lastModified ?? lastModifiedMap.get(entry.sourceFile),
    ),
  );

  validateResolvedEntries(resolvedEntries);

  const artifacts = renderArtifacts(resolvedEntries, config);

  return { artifacts, warnings };
}

async function loadRawEntries(
  moduleFiles: string[],
): Promise<RawEntryWithSource[]> {
  const result: RawEntryWithSource[] = [];

  for (const file of moduleFiles) {
    const mod = await loadSiteIndexModule(file);
    const entries = extractEntries(mod);

    for (const entry of entries) {
      result.push({ ...entry, sourceFile: file });
    }
  }

  return result;
}

function extractEntries(mod: unknown): RawEntry[] {
  const moduleExports = mod as {
    siteIndex?: RawEntry;
    siteIndexes?: RawEntry[];
  };

  if (moduleExports.siteIndex && moduleExports.siteIndexes) {
    throw new Error("Module cannot export both siteIndex and siteIndexes");
  }

  if (moduleExports.siteIndex) return [moduleExports.siteIndex];
  if (moduleExports.siteIndexes) return moduleExports.siteIndexes;

  throw new Error("Module must export siteIndex or siteIndexes");
}

function normalizeEntries(entries: RawEntryWithSource[]): CollectedEntry[] {
  return entries.map((entry) => createCollectedEntry(entry));
}

function createCollectedEntry(entry: RawEntryWithSource): CollectedEntry {
  return {
    url: entry.url,
    sitemap: entry.sitemap ?? "pages",
    index: entry.index ?? true,
    sourceFile: entry.sourceFile,
    ...(entry.lastModified ? { lastModified: entry.lastModified } : {}),
  };
}

function createResolvedEntry(
  entry: CollectedEntry,
  lastModified: string | undefined,
): ResolvedEntry {
  return {
    url: entry.url,
    sitemap: entry.sitemap,
    index: entry.index,
    ...(lastModified ? { lastModified } : {}),
  };
}

function renderArtifacts(
  entries: ResolvedEntry[],
  config: NormalizedConfig,
): GeneratedArtifact[] {
  const entriesBySitemap = new Map<string, ResolvedEntry[]>();

  for (const entry of entries) {
    if (!entry.index) continue;

    const sitemapEntries = entriesBySitemap.get(entry.sitemap);

    if (sitemapEntries) {
      sitemapEntries.push(entry);
      continue;
    }

    entriesBySitemap.set(entry.sitemap, [entry]);
  }

  const artifacts: GeneratedArtifact[] = [];
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

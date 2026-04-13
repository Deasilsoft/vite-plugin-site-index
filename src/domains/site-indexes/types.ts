import type { WithWarnings } from "@/shared/types.js";

export type SiteIndex = {
  url: `/${string}`;
  lastModified?: string;
  sitemap?: string;
  index?: boolean;
};

export type SiteIndexes = SiteIndex[];

export type EntryModule = {
  siteIndexes: SiteIndexes;
};

export type Registry = Record<string, EntryModule>;

export type RegistryLoadResult = WithWarnings<{
  registry: Registry;
}>;

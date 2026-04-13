import type { Artifact } from "@/domains/artifacts";
import type { SiteIndexes } from "@/domains/site-indexes";
import type { WithWarnings } from "@/shared/types.js";

export type PipelineOutput = WithWarnings<{
  artifacts: Artifact[];
}>;

export type SiteIndexesSourceResult = WithWarnings<{
  siteIndexes: SiteIndexes;
}>;

export type SiteIndexesSource = {
  loadSiteIndexes: () => Promise<SiteIndexesSourceResult>;
};

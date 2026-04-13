import { buildArtifacts } from "@/domains/artifacts";
import type { Config } from "@/domains/config";
import { resolveSiteIndexes } from "./resolve";
import type { PipelineOutput, SiteIndexesSource } from "./types";
import { assertValidSiteIndexes } from "./validate";

export async function pipeline(
  config: Config,
  siteIndexesSource: SiteIndexesSource,
): Promise<PipelineOutput> {
  const { siteIndexes: rawSiteIndexes, warnings } =
    await siteIndexesSource.loadSiteIndexes();
  const siteIndexes = resolveSiteIndexes(rawSiteIndexes);

  assertValidSiteIndexes(siteIndexes);

  const artifacts = buildArtifacts(siteIndexes, config.siteUrl);

  return { artifacts, warnings };
}

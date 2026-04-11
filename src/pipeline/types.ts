export type GeneratedArtifact = {
  path: string;
  content: string;
};

export type GenerateSiteArtifactsResult = {
  artifacts: GeneratedArtifact[];
  warnings: string[];
};

export type RawEntry = {
  url: `/${string}`;
  lastModified?: string;
  sitemap?: string;
  index?: boolean;
};

export type CollectedEntry = {
  url: `/${string}`;
  lastModified?: string;
  sitemap: string;
  index: boolean;
  sourceFile: string;
};

export type ResolvedEntry = {
  url: `/${string}`;
  lastModified?: string;
  sitemap: string;
  index: boolean;
};

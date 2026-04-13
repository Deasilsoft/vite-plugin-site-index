export type ResolvedSiteIndex = {
  url: `/${string}`;
  lastModified?: string;
  sitemap: string;
  index: boolean;
};

export type Artifact = {
  path: string;
  content: string;
};

export type SiteIndex = {
  url: `/${string}`;
  lastModified?: string;
  sitemap?: string;
  index?: boolean;
};

export type ResolvedSiteIndex = {
  url: `/${string}`;
  lastModified?: string;
  sitemap: string;
  index: boolean;
  sourceFile: string;
};

export type ResultSiteIndex = {
  url: `/${string}`;
  lastModified?: string;
  sitemap: string;
  index: boolean;
};

export type Config = {
  siteUrl: string;
  include?: string[];
  exclude?: string[];
  userAgent?: string;
};

export type ResolvedConfig = {
  siteUrl: string;
  include: string[];
  exclude: string[];
  userAgent: string;
};

export type ResultItem = {
  path: string;
  content: string;
};

export type Result = {
  artifacts: ResultItem[];
  warnings: string[];
};

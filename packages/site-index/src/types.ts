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
};

export type SourcedResolvedSiteIndex = {
  filePath: string;
  siteIndex: ResolvedSiteIndex;
};

export type Module = {
  filePath: string;
  importId: string;
};

export type LoadedModule = {
  module: Module;
  exports: {
    default: SiteIndex[];
  };
};

export type ResolvedModule = {
  module: Module;
  siteIndexes: SiteIndex[];
};

export type Warning = {
  message: string;
  filePath?: string;
};

export type DataWithWarnings<T> = {
  data: T;
  warnings: Warning[];
};

export type Options = {
  siteUrl: string;
  discoveryRoot: string;
  loadDiscoveredModules: (
    modules: Module[],
  ) => Promise<DataWithWarnings<LoadedModule[]>>;
};

export type Artifact = {
  filePath: string;
  content: string;
};

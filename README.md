# vite-plugin-site-index

[![codecov](https://codecov.io/gh/Deasilsoft/vite-plugin-site-index/branch/main/graph/badge.svg)](https://codecov.io/gh/Deasilsoft/vite-plugin-site-index)

A Vite plugin that generates:

- `sitemap.xml` as a sitemap index
- `sitemap-*.xml` leaf sitemaps
- `robots.txt`

from dedicated metadata modules.

## How Discovery Works

The plugin scans your project for `*.site-index.<ext>` files and loads them through Vite SSR — at build time via a dedicated Vite server, and at dev time via the live dev server.

Supported extensions: `.ts`, `.js`, `.mjs`

Each matched module must export `siteIndexes`:

```ts
// about.site-index.ts
import type { SiteIndexes } from "vite-plugin-site-index";

export const siteIndexes: SiteIndexes = [{ url: "/about" }];
```

## Aliases & Imports

Because modules are loaded through Vite SSR, your **project's Vite config is fully respected** inside `.site-index.*` files. You can freely use:

- path aliases (e.g. `@/lib/db`)
- any installed npm package
- async code, database clients, API calls

```ts
// blog.site-index.ts — fetching posts from a database
import type { SiteIndexes } from "vite-plugin-site-index";
import { db } from "@/lib/db";

const posts = await db.query("SELECT slug, updated_at FROM posts");

export const siteIndexes: SiteIndexes = posts.map((p) => ({
  url: `/${p.slug}`,
  sitemap: "blog",
  lastModified: new Date(p.updated_at).toISOString(),
}));
```

## Plugin Options

```ts
type Options = {
  siteUrl: string;
};
```

## Status

Early development.

## Scope

This package handles:

- sitemap index generation
- leaf sitemap generation
- robots.txt generation

This package does not handle:

- HTML meta tags
- canonical URLs
- Open Graph
- `priority`
- `changefreq`
- nested sitemap indexes

## Metadata

```ts
export type SiteIndexMeta = {
  url: `/${string}`;
  lastModified?: string;
  sitemap?: string;
  index?: boolean;
};
```

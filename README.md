# Official site-index packages

Generate sitemaps (tree) and robots.txt in from code or data.

Deterministic sitemap and robots generation split into three focused packages:

- `site-index`: core pipeline library (framework-agnostic)
- `site-index-cli`: CLI wrapper for Node/cron usage
- `vite-plugin-site-index`: Vite integration built on top of `site-index`

The split is intentional: each package has one job, and they all share the same module format (`*.site-index.*`) and output artifacts.

## Package map

| Package                  | Purpose                                                             | Best for                                                     |
| ------------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------ |
| `site-index`             | Discovery, module loading contract, validation, artifact generation | Programmatic integration in any Node app                     |
| `site-index-cli`         | Running the pipeline from terminal/CI/cron                          | Scheduled jobs, static generation without writing glue code  |
| `vite-plugin-site-index` | Vite build/dev integration                                          | Vite apps that want sitemap + robots artifacts automatically |

## Install

Install the package that matches your entrypoint:

```bash
npm install -D vite-plugin-site-index
```

```bash
npm install -D site-index-cli
```

```bash
npm install site-index
```

## Shared content model (`*.site-index.*`)

Each discovered module exports a default array:

```ts
import type { SiteIndex } from "site-index";

export default [
  { url: "/" },
  { url: "/about" },
  { url: "/blog/first-post", sitemap: "blog" },
  { url: "/admin", index: false },
] satisfies SiteIndex[];
```

Dynamic data is supported:

```ts
import type { SiteIndex } from "site-index";

const rows = [{ slug: "first-post", updatedAt: "2026-04-01T00:00:00.000Z" }];

export default rows.map((row) => ({
  url: `/blog/${row.slug}`,
  sitemap: "blog",
  lastModified: row.updatedAt,
})) satisfies SiteIndex[];
```

## Output artifacts

All three packages produce the same artifact set:

- `sitemap.xml` (sitemap index)
- `sitemap-<name>.xml`
- `robots.txt`

## Flow 1: Vite plugin (`vite-plugin-site-index`)

Use this when your app is already built with Vite.

```ts
import { defineConfig } from "vite";
import { siteIndexPlugin } from "vite-plugin-site-index";

export default defineConfig({
  plugins: [
    siteIndexPlugin({
      siteUrl: "https://example.com",
    }),
  ],
});
```

Behavior:

- `vite build` emits artifacts into the bundle output
- `vite dev` serves `/sitemap.xml`, `/sitemap-<name>.xml`, and `/robots.txt`

## Flow 2: CLI (`site-index-cli`)

Use this for CI/cron/manual builds.

```bash
site-index build --site-url https://example.com --root .
```

Common options:

- `--site-url <url>` required base URL
- `--root <path>` discovery root (default: current directory)
- `--out-dir <dir>` artifact output directory (default: `dist`)
- `--config <path>` Vite config path
- `--mode <mode>` Vite mode

Scaffold helper:

```bash
site-index scaffold pages --dir src
```

## Flow 3: Core library (`site-index`)

Use this when you want full programmatic control.

```ts
import { runSiteIndexPipeline } from "site-index";

const result = await runSiteIndexPipeline({
  siteUrl: "https://example.com",
  discoveryRoot: process.cwd(),
  loadDiscoveredModules: async (modules) => {
    const data = await Promise.all(
      modules.map(async (module) => ({
        module,
        exports: (await import(module.filePath)) as { default: unknown[] },
      })),
    );

    return { data, warnings: [] };
  },
});

console.log(result.data);
console.log(result.warnings);
```

## Workspace development

This repository is an npm workspaces monorepo (`packages/*`).

```bash
npm install
npm run build
npm run typecheck
npm run lint
npm run test
```

Per-package scripts are also available under each `packages/*/package.json`.

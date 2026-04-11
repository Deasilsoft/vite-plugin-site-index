import type { ResolvedEntry } from "../pipeline/types.js";

export function renderSitemapXml(
  entries: ResolvedEntry[],
  siteUrl: string,
): string {
  const urls = entries
    .map((e) => {
      const loc = `${siteUrl}${e.url}`;
      const lastmod = e.lastModified
        ? `<lastmod>${e.lastModified}</lastmod>`
        : "";

      return `<url><loc>${loc}</loc>${lastmod}</url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

import type { ResolvedEntry } from "../pipeline/types.js";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function renderSitemapXml(
  entries: ResolvedEntry[],
  siteUrl: string,
): string {
  const urls = entries
    .map((e) => {
      const loc = escapeXml(`${siteUrl}${e.url}`);
      const lastmod = e.lastModified
        ? `<lastmod>${escapeXml(e.lastModified)}</lastmod>`
        : "";

      return `<url><loc>${loc}</loc>${lastmod}</url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

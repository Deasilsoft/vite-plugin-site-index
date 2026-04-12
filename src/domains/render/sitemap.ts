import type { ResultSiteIndex } from "@/shared/types.js";
import { normalizeUrl } from "@/shared/utils.js";
import { escapeXml } from "@/shared/xml.js";

export function renderSitemapXml(
  entries: ResultSiteIndex[],
  siteUrl: string,
): string {
  const normalizedSiteUrl = normalizeUrl(siteUrl);
  const urls = entries
    .map((entry) => {
      const loc = escapeXml(`${normalizedSiteUrl}${entry.url}`);
      const lastmod = entry.lastModified
        ? `<lastmod>${escapeXml(entry.lastModified)}</lastmod>`
        : "";

      return `<url><loc>${loc}</loc>${lastmod}</url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

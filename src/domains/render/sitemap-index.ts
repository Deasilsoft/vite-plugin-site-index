import { normalizeUrl } from "@/shared/utils.js";
import { escapeXml } from "@/shared/xml.js";

export function renderSitemapIndexXml(
  sitemapPaths: string[],
  siteUrl: string,
): string {
  const normalizedSiteUrl = normalizeUrl(siteUrl);
  const items = sitemapPaths
    .map(
      (p) =>
        `<sitemap><loc>${escapeXml(`${normalizedSiteUrl}${p}`)}</loc></sitemap>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">${items}</sitemapindex>`;
}

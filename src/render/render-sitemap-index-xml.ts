export function renderSitemapIndexXml(
  sitemapPaths: string[],
  siteUrl: string,
): string {
  const normalizedSiteUrl = siteUrl.replace(/\/+$/, "");
  const items = sitemapPaths
    .map((p) => `<sitemap><loc>${normalizedSiteUrl}${p}</loc></sitemap>`)
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</sitemapindex>`;
}

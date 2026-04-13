import { normalizeUrl } from "@/shared/utils.js";

export function renderRobotsTxt(siteUrl: string, disallowed: string[]): string {
  const lines: string[] = [];
  const normalizedSiteUrl = normalizeUrl(siteUrl);

  lines.push("User-agent: *");
  lines.push(`Sitemap: ${normalizedSiteUrl}/sitemap.xml`);

  for (const path of disallowed) {
    lines.push(`Disallow: ${path}`);
  }

  return lines.join("\n");
}

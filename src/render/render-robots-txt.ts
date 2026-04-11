export function renderRobotsTxt(options: {
  siteUrl: string;
  userAgent: string;
  disallowed: string[];
}): string {
  const lines: string[] = [];
  const normalizedSiteUrl = options.siteUrl.replace(/\/+$/, "");

  lines.push(`User-agent: ${options.userAgent}`);
  lines.push(`Sitemap: ${normalizedSiteUrl}/sitemap.xml`);

  for (const path of options.disallowed) {
    lines.push(`Disallow: ${path}`);
  }

  return lines.join("\n");
}

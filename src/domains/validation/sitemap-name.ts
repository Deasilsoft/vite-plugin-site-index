const SITEMAP_NAME_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function validateSitemapName(name: string): void {
  if (!SITEMAP_NAME_REGEX.test(name)) {
    throw new Error(`Invalid sitemap name: ${name}`);
  }
}

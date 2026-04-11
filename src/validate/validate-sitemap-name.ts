const REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function validateSitemapName(name: string): void {
  if (!REGEX.test(name)) {
    throw new Error(`Invalid sitemap name: ${name}`);
  }
}

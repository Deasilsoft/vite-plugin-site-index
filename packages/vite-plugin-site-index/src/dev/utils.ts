const ARTIFACT_URLS = new Set(["/sitemap.xml", "/robots.txt"]);
const WATCH_EVENTS = ["add", "change", "unlink"] as const;

export function isArtifactUrl(url: string): boolean {
  if (ARTIFACT_URLS.has(url)) return true;
  return url.startsWith("/sitemap-") && url.endsWith(".xml");
}

export function contentTypeForArtifactPath(path: string): string {
  if (path.endsWith(".xml")) return "application/xml";
  if (path.endsWith(".txt")) return "text/plain";
  return "application/octet-stream";
}

export function isHeadMethod(method: string | undefined): boolean {
  return method === "HEAD";
}

export function isSiteIndexFile(file: string): boolean {
  return file.includes(".site-index.");
}

export function watchEvents(): readonly ("add" | "change" | "unlink")[] {
  return WATCH_EVENTS;
}

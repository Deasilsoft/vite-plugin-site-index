import type { ArtifactsRef, Middleware } from "./types.js";

function isSiteIndexUrl(url: string): boolean {
  return (
    url === "/sitemap.xml" ||
    (url.startsWith("/sitemap-") && url.endsWith(".xml")) ||
    url === "/robots.txt"
  );
}

function contentTypeFor(path: string): string {
  return path.endsWith(".xml") ? "application/xml" : "text/plain";
}

export function createMiddleware(
  artifactsRef: ArtifactsRef,
  refreshArtifacts: () => Promise<void>,
): Middleware {
  return async (req, res, next) => {
    if (!req.url) return next();

    if (isSiteIndexUrl(req.url)) {
      await refreshArtifacts();
    }

    const match = artifactsRef.current.find((a) => a.path === req.url);

    if (!match) return next();

    res.setHeader("Content-Type", contentTypeFor(match.path));
    res.end(match.content);
  };
}

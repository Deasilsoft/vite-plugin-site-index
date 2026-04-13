import type { Artifact } from "@/domains/artifacts";
import type { IncomingMessage, ServerResponse } from "node:http";
import { describe, expect, it, vi } from "vitest";
import { createMiddleware } from "./middleware.js";
import type { ArtifactsRef } from "./types.js";

describe("createMiddleware", () => {
  it("calls next when req.url is missing", async () => {
    const { refreshArtifacts, next, run } = createMiddlewareHarness();

    await run();

    expect(next).toHaveBeenCalled();
    expect(refreshArtifacts).not.toHaveBeenCalled();
  });

  it("calls next when no artifact matches", async () => {
    const { res, next, run } = createMiddlewareHarness("/missing.xml", [
      { path: "/sitemap.xml", content: "<xml />" },
    ]);

    await run();

    expect(next).toHaveBeenCalled();
    expect(res.setHeader).not.toHaveBeenCalled();
  });

  it("refreshes for sitemap requests and serves xml content type", async () => {
    const { artifactsRef, refreshArtifacts, run, res, next } =
      createMiddlewareHarness("/sitemap.xml", [
        { path: "/sitemap.xml", content: "<old />" },
      ]);

    refreshArtifacts.mockImplementation(async () => {
      artifactsRef.current = [{ path: "/sitemap.xml", content: "<new />" }];
    });

    await run();

    expect(refreshArtifacts).toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "application/xml",
    );
    expect(res.end).toHaveBeenCalledWith("<new />");
    expect(next).not.toHaveBeenCalled();
  });

  it("refreshes for named sitemap requests", async () => {
    const { refreshArtifacts, run, res, next } = createMiddlewareHarness(
      "/sitemap-blog.xml",
      [{ path: "/sitemap-blog.xml", content: "<blog />" }],
    );

    await run();

    expect(refreshArtifacts).toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "application/xml",
    );
    expect(res.end).toHaveBeenCalledWith("<blog />");
    expect(next).not.toHaveBeenCalled();
  });

  it("serves robots with text/plain content type", async () => {
    const { refreshArtifacts, run, res, next } = createMiddlewareHarness(
      "/robots.txt",
      [{ path: "/robots.txt", content: "User-agent: *" }],
    );

    await run();

    expect(refreshArtifacts).toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/plain");
    expect(res.end).toHaveBeenCalledWith("User-agent: *");
    expect(next).not.toHaveBeenCalled();
  });

  it("does not refresh for non site-index requests", async () => {
    const { refreshArtifacts, res, next, run } = createMiddlewareHarness(
      "/asset.txt",
      [{ path: "/asset.txt", content: "asset" }],
    );

    await run();

    expect(refreshArtifacts).not.toHaveBeenCalled();
    expect(res.end).toHaveBeenCalledWith("asset");
    expect(next).not.toHaveBeenCalled();
  });
});

function createHttpStubs(url?: string): {
  req: IncomingMessage;
  res: ServerResponse;
  next: (err?: unknown) => void;
} {
  const req = {} as IncomingMessage;

  if (url !== undefined) {
    req.url = url;
  }

  return {
    req,
    res: {
      setHeader: vi.fn(),
      end: vi.fn(),
    } as unknown as ServerResponse,
    next: vi.fn<(err?: unknown) => void>(),
  };
}

function createArtifactsRef(current: Artifact[] = []): ArtifactsRef {
  return { current };
}

function createMiddlewareHarness(url?: string, artifacts: Artifact[] = []) {
  const artifactsRef = createArtifactsRef(artifacts);
  const refreshArtifacts = vi.fn().mockResolvedValue(undefined);
  const middleware = createMiddleware(artifactsRef, refreshArtifacts);
  const { req, res, next } = createHttpStubs(url);

  return {
    artifactsRef,
    refreshArtifacts,
    res,
    next,
    run: () => middleware(req, res, next),
  };
}

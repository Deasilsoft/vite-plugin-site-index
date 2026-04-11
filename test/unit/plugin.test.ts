import type { Plugin, ViteDevServer } from "vite";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { siteIndexPlugin } from "../../src/plugin.js";

const { normalizeConfigMock, generateSiteArtifactsMock } = vi.hoisted(() => ({
  normalizeConfigMock: vi.fn(),
  generateSiteArtifactsMock: vi.fn(),
}));

vi.mock("../../src/config.js", () => ({
  normalizeConfig: normalizeConfigMock,
}));

vi.mock("../../src/pipeline/generate-site-artifacts.js", () => ({
  generateSiteArtifacts: generateSiteArtifactsMock,
}));

describe("siteIndexPlugin", () => {
  beforeEach(() => {
    normalizeConfigMock.mockReset();
    generateSiteArtifactsMock.mockReset();
  });

  it("buildStart generates artifacts and warns through the plugin context", async () => {
    normalizeConfigMock.mockReturnValue({
      siteUrl: "https://example.com",
      include: ["src/**/site-index.ts", "src/**/*.site-index.ts"],
      exclude: [],
      userAgent: "*",
    });

    generateSiteArtifactsMock.mockResolvedValue({
      artifacts: [
        { path: "/sitemap.xml", content: "<index />" },
        { path: "/robots.txt", content: "User-agent: *" },
      ],
      warnings: ["warning one", "warning two"],
    });

    const plugin = siteIndexPlugin({
      siteUrl: "https://example.com",
    });

    const warn = vi.fn();

    await callBuildStart(plugin, { warn });

    expect(normalizeConfigMock).toHaveBeenCalledWith({
      siteUrl: "https://example.com",
    });

    expect(generateSiteArtifactsMock).toHaveBeenCalledWith({
      siteUrl: "https://example.com",
      include: ["src/**/site-index.ts", "src/**/*.site-index.ts"],
      exclude: [],
      userAgent: "*",
    });

    expect(warn).toHaveBeenCalledWith("warning one");
    expect(warn).toHaveBeenCalledWith("warning two");
  });

  it("configureServer serves cached xml artifacts", async () => {
    normalizeConfigMock.mockReturnValue({
      siteUrl: "https://example.com",
      include: ["src/**/site-index.ts", "src/**/*.site-index.ts"],
      exclude: [],
      userAgent: "*",
    });

    generateSiteArtifactsMock.mockResolvedValue({
      artifacts: [{ path: "/sitemap.xml", content: "<index />" }],
      warnings: [],
    });

    const plugin = siteIndexPlugin({
      siteUrl: "https://example.com",
    });

    await callBuildStart(plugin, { warn: vi.fn() });

    const middleware = captureMiddleware(plugin);

    const setHeader = vi.fn();
    const end = vi.fn();
    const next = vi.fn();

    middleware({ url: "/sitemap.xml" }, { setHeader, end }, next);

    expect(setHeader).toHaveBeenCalledWith("Content-Type", "application/xml");
    expect(end).toHaveBeenCalledWith("<index />");
    expect(next).not.toHaveBeenCalled();
  });

  it("configureServer serves cached text artifacts", async () => {
    normalizeConfigMock.mockReturnValue({
      siteUrl: "https://example.com",
      include: ["src/**/site-index.ts", "src/**/*.site-index.ts"],
      exclude: [],
      userAgent: "*",
    });

    generateSiteArtifactsMock.mockResolvedValue({
      artifacts: [{ path: "/robots.txt", content: "User-agent: *" }],
      warnings: [],
    });

    const plugin = siteIndexPlugin({
      siteUrl: "https://example.com",
    });

    await callBuildStart(plugin, { warn: vi.fn() });

    const middleware = captureMiddleware(plugin);

    const setHeader = vi.fn();
    const end = vi.fn();
    const next = vi.fn();

    middleware({ url: "/robots.txt" }, { setHeader, end }, next);

    expect(setHeader).toHaveBeenCalledWith("Content-Type", "text/plain");
    expect(end).toHaveBeenCalledWith("User-agent: *");
    expect(next).not.toHaveBeenCalled();
  });

  it("configureServer calls next when no artifact matches", async () => {
    normalizeConfigMock.mockReturnValue({
      siteUrl: "https://example.com",
      include: ["src/**/site-index.ts", "src/**/*.site-index.ts"],
      exclude: [],
      userAgent: "*",
    });

    generateSiteArtifactsMock.mockResolvedValue({
      artifacts: [{ path: "/sitemap.xml", content: "<index />" }],
      warnings: [],
    });

    const plugin = siteIndexPlugin({
      siteUrl: "https://example.com",
    });

    await callBuildStart(plugin, { warn: vi.fn() });

    const middleware = captureMiddleware(plugin);
    const next = vi.fn();

    middleware(
      { url: "/does-not-exist.xml" },
      { setHeader: vi.fn(), end: vi.fn() },
      next,
    );

    expect(next).toHaveBeenCalled();
  });

  it("configureServer calls next when req.url is missing", () => {
    normalizeConfigMock.mockReturnValue({
      siteUrl: "https://example.com",
      include: ["src/**/site-index.ts", "src/**/*.site-index.ts"],
      exclude: [],
      userAgent: "*",
    });

    const plugin = siteIndexPlugin({
      siteUrl: "https://example.com",
    });

    const middleware = captureMiddleware(plugin);
    const next = vi.fn();

    middleware({}, { setHeader: vi.fn(), end: vi.fn() }, next);

    expect(next).toHaveBeenCalled();
  });

  it("generateBundle emits cached artifacts", async () => {
    normalizeConfigMock.mockReturnValue({
      siteUrl: "https://example.com",
      include: ["src/**/site-index.ts", "src/**/*.site-index.ts"],
      exclude: [],
      userAgent: "*",
    });

    generateSiteArtifactsMock.mockResolvedValue({
      artifacts: [
        { path: "/sitemap.xml", content: "<index />" },
        { path: "/robots.txt", content: "User-agent: *" },
      ],
      warnings: [],
    });

    const plugin = siteIndexPlugin({
      siteUrl: "https://example.com",
    });

    await callBuildStart(plugin, { warn: vi.fn() });

    const emitFile = vi.fn();

    callGenerateBundle(plugin, { emitFile });

    expect(emitFile).toHaveBeenCalledWith({
      type: "asset",
      fileName: "sitemap.xml",
      source: "<index />",
    });

    expect(emitFile).toHaveBeenCalledWith({
      type: "asset",
      fileName: "robots.txt",
      source: "User-agent: *",
    });
  });
});

type Middleware = (
  req: { url?: string },
  res: {
    setHeader: ReturnType<typeof vi.fn>;
    end: ReturnType<typeof vi.fn>;
  },
  next: ReturnType<typeof vi.fn>,
) => void;

function getHookHandler<T extends (...args: any[]) => any>(
  hook: Plugin[keyof Plugin],
): T {
  if (typeof hook === "function") {
    return hook as T;
  }

  if (hook && typeof hook === "object" && "handler" in hook) {
    return hook.handler as T;
  }

  throw new Error("Expected plugin hook to exist");
}

async function callBuildStart(
  plugin: Plugin,
  context: { warn: ReturnType<typeof vi.fn> },
): Promise<void> {
  const buildStart = getHookHandler<
    (this: { warn: ReturnType<typeof vi.fn> }) => void | Promise<void>
  >(plugin.buildStart);

  await buildStart.call(context);
}

function captureMiddleware(plugin: Plugin): Middleware {
  const configureServer = getHookHandler<(server: ViteDevServer) => void>(
    plugin.configureServer,
  );

  let middleware: Middleware | undefined;

  configureServer({
    middlewares: {
      use(fn: Middleware) {
        middleware = fn;
      },
    },
  } as unknown as ViteDevServer);

  if (!middleware) {
    throw new Error("Expected middleware to be registered");
  }

  return middleware;
}

function callGenerateBundle(
  plugin: Plugin,
  context: { emitFile: ReturnType<typeof vi.fn> },
): void {
  const generateBundle = getHookHandler<
    (this: { emitFile: ReturnType<typeof vi.fn> }) => void | Promise<void>
  >(plugin.generateBundle);

  generateBundle.call(context);
}

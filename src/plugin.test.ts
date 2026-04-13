import { siteIndexPlugin } from "@/plugin";
import type { Plugin, ResolvedConfig, ViteDevServer } from "vite";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  resolveConfigMock,
  pipelineMock,
  configureSiteIndexServerMock,
  createSiteIndexesSourceMock,
} = vi.hoisted(() => ({
  resolveConfigMock: vi.fn(),
  pipelineMock: vi.fn(),
  configureSiteIndexServerMock: vi.fn(),
  createSiteIndexesSourceMock: vi.fn(),
}));

vi.mock("@/domains/config", () => ({
  resolveConfig: resolveConfigMock,
}));

vi.mock("@/domains/pipeline", () => ({
  pipeline: pipelineMock,
}));

vi.mock("@/domains/site-indexes", () => ({
  createSiteIndexesSource: createSiteIndexesSourceMock,
}));

vi.mock("@/domains/vite-server", () => ({
  configureSiteIndexServer: configureSiteIndexServerMock,
}));

describe("siteIndexPlugin", () => {
  const resolvedConfig = { siteUrl: "https://example.com" };

  function createPlugin(): Plugin {
    return siteIndexPlugin({ siteUrl: "https://example.com" });
  }

  beforeEach(() => {
    resolveConfigMock.mockReset();
    pipelineMock.mockReset();
    configureSiteIndexServerMock.mockReset();
    createSiteIndexesSourceMock.mockReset();
    resolveConfigMock.mockReturnValue(resolvedConfig);
    createSiteIndexesSourceMock.mockReturnValue({
      loadSiteIndexes: vi.fn(),
    });
  });

  describe("buildStart", () => {
    it("forwards pipeline warnings", async () => {
      pipelineMock.mockResolvedValue({
        artifacts: [],
        warnings: ["warning one"],
      });

      const warn = vi.fn();
      await callBuildStart(createPlugin(), { warn });

      expect(createSiteIndexesSourceMock).toHaveBeenCalledWith(undefined);
      expect(pipelineMock).toHaveBeenCalledWith(
        resolvedConfig,
        expect.objectContaining({ loadSiteIndexes: expect.any(Function) }),
      );
      expect(warn).toHaveBeenCalledWith("warning one");
    });

    it("skips pipeline when command is serve", async () => {
      const plugin = createPlugin();

      callConfigResolved(plugin, "serve");
      await callBuildStart(plugin, { warn: vi.fn() });

      expect(pipelineMock).not.toHaveBeenCalled();
    });

    it("stores artifacts for generateBundle", async () => {
      pipelineMock.mockResolvedValue({
        artifacts: [{ path: "/sitemap.xml", content: "<index />" }],
        warnings: [],
      });

      const plugin = createPlugin();
      await callBuildStart(plugin, { warn: vi.fn() });

      const emitFile = vi.fn();
      await callGenerateBundle(plugin, { emitFile });

      expect(emitFile).toHaveBeenCalledWith({
        type: "asset",
        fileName: "sitemap.xml",
        source: "<index />",
      });
    });
  });

  describe("configureServer", () => {
    it("delegates server wiring to vite-server", () => {
      const plugin = createPlugin();
      const server = createServerStub();

      callConfigureServer(plugin, server);

      expect(configureSiteIndexServerMock).toHaveBeenCalledWith(
        server,
        expect.objectContaining({ current: [] }),
        expect.any(Function),
      );
    });

    it("prefixes warnings when refreshing from the dev server", async () => {
      pipelineMock.mockResolvedValue({
        artifacts: [],
        warnings: ["dev warning"],
      });

      const plugin = createPlugin();
      const server = createServerStub();

      callConfigureServer(plugin, server);

      const refreshFromDevServer = getRefreshFromDevServerCallback();
      await refreshFromDevServer(server);

      expect(server.config.logger.warn).toHaveBeenCalledWith(
        "[vite-plugin-site-index] dev warning",
      );
    });
  });
});

function getRefreshFromDevServerCallback(): (
  server: ViteDevServer,
) => Promise<void> {
  const call = configureSiteIndexServerMock.mock.calls.at(-1);
  const callback = call?.[2];

  if (typeof callback !== "function") {
    throw new Error(
      "Expected configureSiteIndexServer to receive refresh callback",
    );
  }

  return callback as (server: ViteDevServer) => Promise<void>;
}

function getHookHandler<T extends (...args: never[]) => unknown>(
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

async function callGenerateBundle(
  plugin: Plugin,
  context: { emitFile: ReturnType<typeof vi.fn> },
): Promise<void> {
  const generateBundle = getHookHandler<
    (this: { emitFile: ReturnType<typeof vi.fn> }) => void | Promise<void>
  >(plugin.generateBundle);

  await generateBundle.call(context);
}

function callConfigResolved(
  plugin: Plugin,
  command: ResolvedConfig["command"],
): void {
  const configResolved = getHookHandler<(config: ResolvedConfig) => void>(
    plugin.configResolved,
  );

  configResolved({ command } as ResolvedConfig);
}

function callConfigureServer(plugin: Plugin, server: ViteDevServer): void {
  const configureServer = getHookHandler<(server: ViteDevServer) => void>(
    plugin.configureServer,
  );

  configureServer(server);
}

function createServerStub(): ViteDevServer {
  return {
    config: {
      root: process.cwd(),
      logger: {
        warn: vi.fn(),
        error: vi.fn(),
      },
    },
    ssrLoadModule: vi.fn(),
    watcher: {
      on: vi.fn(),
    },
    middlewares: {
      use: vi.fn(),
    },
  } as unknown as ViteDevServer;
}

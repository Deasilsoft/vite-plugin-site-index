import { siteIndexPlugin } from "../src/plugin.js";
import type { Plugin, ResolvedConfig, ViteDevServer } from "vite";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  closeMock,
  createServerMock,
  createViteDevProvisionerMock,
  runSiteIndexPipelineMock,
  ssrLoadModuleMock,
} = vi.hoisted(() => ({
  closeMock: vi.fn(),
  createServerMock: vi.fn(),
  createViteDevProvisionerMock: vi.fn(),
  runSiteIndexPipelineMock: vi.fn(),
  ssrLoadModuleMock: vi.fn(),
}));

vi.mock("site-index", () => ({
  runSiteIndexPipeline: runSiteIndexPipelineMock,
}));

vi.mock("vite", () => ({
  createServer: createServerMock,
}));

vi.mock("../src/provision/vite-dev.js", () => ({
  createViteDevProvisioner: createViteDevProvisionerMock,
}));

describe("siteIndexPlugin", () => {
  function createPlugin(): Plugin {
    return siteIndexPlugin({
      siteUrl: "https://example.com",
    });
  }

  beforeEach(() => {
    closeMock.mockReset();
    closeMock.mockResolvedValue(undefined);

    createServerMock.mockReset();
    createServerMock.mockResolvedValue({
      ssrLoadModule: ssrLoadModuleMock,
      close: closeMock,
    });

    createViteDevProvisionerMock.mockReset();

    runSiteIndexPipelineMock.mockReset();
    runSiteIndexPipelineMock.mockResolvedValue({
      data: [
        {
          filePath: "/sitemap.xml",
          content: "<index />",
        },
      ],
      warnings: [],
    });

    ssrLoadModuleMock.mockReset();
    ssrLoadModuleMock.mockResolvedValue({ default: [] });
  });

  describe("buildStart", () => {
    it("forwards pipeline warnings", async () => {
      runSiteIndexPipelineMock.mockResolvedValueOnce({
        data: [],
        warnings: [{ message: "warning one" }],
      });

      const warn = vi.fn();
      await callBuildStart(createPlugin(), { warn });

      expect(runSiteIndexPipelineMock).toHaveBeenCalledTimes(1);
      expect(warn).toHaveBeenCalledWith("warning one");
    });

    it("skips pipeline when command is serve", async () => {
      const plugin = createPlugin();

      callConfigResolved(plugin, "serve");
      await callBuildStart(plugin, { warn: vi.fn() });

      expect(createServerMock).not.toHaveBeenCalled();
      expect(runSiteIndexPipelineMock).not.toHaveBeenCalled();
    });

    it("stores artifacts for generateBundle", async () => {
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

    it("does not emit when no artifacts exist", async () => {
      const plugin = createPlugin();

      const emitFile = vi.fn();
      await callGenerateBundle(plugin, { emitFile });

      expect(emitFile).not.toHaveBeenCalled();
    });
  });

  describe("configureServer", () => {
    it("delegates server wiring to vite-server", () => {
      const plugin = createPlugin();
      const server = createServerStub();

      callConfigureServer(plugin, server);

      expect(createViteDevProvisionerMock).toHaveBeenCalledWith(
        expect.objectContaining({
          server,
          artifactsRef: expect.objectContaining({
            artifacts: null,
          }),
          refresh: expect.any(Function),
        }),
      );
    });

    it("prefixes warnings when refreshing from the dev server", async () => {
      runSiteIndexPipelineMock.mockResolvedValueOnce({
        data: [],
        warnings: [{ message: "dev warning" }],
      });

      const plugin = createPlugin();
      const server = createServerStub();

      callConfigureServer(plugin, server);

      const refreshFromDevServer = getRefreshFromDevServerCallback();
      await refreshFromDevServer(server);

      expect(runSiteIndexPipelineMock).toHaveBeenCalledTimes(1);
      expect(server.config.logger.warn).toHaveBeenCalledWith(
        "[vite-plugin-site-index] dev warning",
      );
    });
  });
});

function getRefreshFromDevServerCallback(): (
  server: ViteDevServer,
) => Promise<void> {
  const call = createViteDevProvisionerMock.mock.calls.at(-1);
  const callback = call?.[0]?.refresh;

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

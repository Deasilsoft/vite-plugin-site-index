import type { ViteDevServer } from "vite";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { configureSiteIndexServer } from "./server.js";
import type { RefreshFromDevServer } from "./types.js";

const { createMiddlewareMock } = vi.hoisted(() => ({
  createMiddlewareMock: vi.fn(),
}));

vi.mock("./middleware.js", () => ({
  createMiddleware: createMiddlewareMock,
}));

describe("configureSiteIndexServer", () => {
  const artifactsRef = {
    current: [] as Array<{ path: string; content: string }>,
  };

  beforeEach(() => {
    artifactsRef.current = [];
    createMiddlewareMock.mockReset();
    createMiddlewareMock.mockReturnValue(vi.fn());
  });

  it("runs initial refresh and wires middleware", async () => {
    const refreshFromDevServer = vi.fn().mockResolvedValue(undefined);
    const server = createServerHarness();

    configureSiteIndexServer(server, artifactsRef, refreshFromDevServer);

    await vi.waitFor(() =>
      expect(refreshFromDevServer).toHaveBeenCalledTimes(1),
    );

    expect(createMiddlewareMock).toHaveBeenCalledWith(
      artifactsRef,
      expect.any(Function),
    );

    expect(server.middlewares.use).toHaveBeenCalledWith(expect.any(Function));
  });

  it.each(["add", "change", "unlink"])(
    "refreshes on %s for .site-index files",
    async (event) => {
      const refreshFromDevServer = vi.fn().mockResolvedValue(undefined);
      const server = createServerHarness();

      configureSiteIndexServer(server, artifactsRef, refreshFromDevServer);

      await vi.waitFor(() =>
        expect(refreshFromDevServer).toHaveBeenCalledTimes(1),
      );

      refreshFromDevServer.mockClear();
      triggerWatcher(server, event, "/src/about.site-index.ts");

      await vi.waitFor(() =>
        expect(refreshFromDevServer).toHaveBeenCalledTimes(1),
      );
    },
  );

  it("ignores watcher events for non site-index files", async () => {
    const refreshFromDevServer = vi.fn().mockResolvedValue(undefined);
    const server = createServerHarness();

    configureSiteIndexServer(server, artifactsRef, refreshFromDevServer);

    await vi.waitFor(() =>
      expect(refreshFromDevServer).toHaveBeenCalledTimes(1),
    );

    refreshFromDevServer.mockClear();
    triggerWatcher(server, "add", "/src/about.ts");
    triggerWatcher(server, "change", "/src/about.ts");
    triggerWatcher(server, "unlink", "/src/about.ts");

    expect(refreshFromDevServer).not.toHaveBeenCalled();
  });

  it.each([new Error("boom"), "boom"])(
    "logs initial refresh errors for %p",
    async (thrown) => {
      const { server, refreshFromDevServer } = configureWithRefresh();

      refreshFromDevServer.mockRejectedValueOnce(thrown);
      configureSiteIndexServer(server, artifactsRef, refreshFromDevServer);

      await expectLoggedError(server, "[vite-plugin-site-index] boom");
    },
  );

  it("refresh callback passed to middleware logs failures", async () => {
    const { server, refreshFromDevServer } = configureWithRefresh();
    const refreshFromMiddleware = configureAndGetMiddlewareRefresh(
      server,
      artifactsRef,
      refreshFromDevServer,
    );

    refreshFromDevServer.mockRejectedValueOnce("middleware refresh failed");

    await refreshFromMiddleware();

    await expectLoggedError(
      server,
      "[vite-plugin-site-index] middleware refresh failed",
    );
  });
});

function configureWithRefresh(): {
  server: ViteDevServer;
  refreshFromDevServer: ReturnType<typeof createRefreshFromDevServerMock>;
} {
  return {
    server: createServerHarness(),
    refreshFromDevServer: createRefreshFromDevServerMock(),
  };
}

function createServerHarness(): ViteDevServer {
  const handlers = new Map<string, (file: string) => void>();

  return {
    config: {
      root: process.cwd(),
      logger: {
        warn: vi.fn(),
        error: vi.fn(),
      },
    },
    watcher: {
      on: vi.fn((event: string, fn: (file: string) => void) => {
        handlers.set(event, fn);
      }),
    },
    middlewares: {
      use: vi.fn(),
    },
    ssrLoadModule: vi.fn(),
    __handlers: handlers,
  } as unknown as ViteDevServer;
}

function triggerWatcher(
  server: ViteDevServer,
  event: string,
  file: string,
): void {
  const handlers = (
    server as unknown as { __handlers: Map<string, (file: string) => void> }
  ).__handlers;

  handlers.get(event)?.(file);
}

function getRefreshFromMiddleware(): () => Promise<void> {
  const call = createMiddlewareMock.mock.calls.at(-1);
  const refresh = call?.[1];

  if (typeof refresh !== "function") {
    throw new Error("Expected createMiddleware to receive refresh callback");
  }

  return refresh as () => Promise<void>;
}

function configureAndGetMiddlewareRefresh(
  server: ViteDevServer,
  artifactsRef: { current: Array<{ path: string; content: string }> },
  refreshFromDevServer: RefreshFromDevServer,
): () => Promise<void> {
  configureSiteIndexServer(server, artifactsRef, refreshFromDevServer);

  return getRefreshFromMiddleware();
}

function expectLoggedError(
  server: ViteDevServer,
  message: string,
): Promise<void> {
  return vi.waitFor(() =>
    expect(server.config.logger.error).toHaveBeenCalledWith(message),
  );
}

function createRefreshFromDevServerMock() {
  return vi.fn<RefreshFromDevServer>().mockResolvedValue(undefined);
}

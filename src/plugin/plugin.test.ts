import { siteIndexPlugin } from "@/plugin";
import type { Plugin, ViteDevServer } from "vite";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { normalizeConfigMock, pipelineMock } = vi.hoisted(() => ({
  normalizeConfigMock: vi.fn(),
  pipelineMock: vi.fn(),
}));

vi.mock("./config.js", () => ({
  normalizeConfig: normalizeConfigMock,
}));

vi.mock("./pipeline.js", () => ({
  pipeline: pipelineMock,
}));

describe("siteIndexPlugin", () => {
  const normalizedConfig = {
    siteUrl: "https://example.com",
    include: ["src/**/site-index.ts", "src/**/*.site-index.ts"],
    exclude: [],
    userAgent: "*",
  };

  beforeEach(() => {
    normalizeConfigMock.mockReset();
    pipelineMock.mockReset();
    normalizeConfigMock.mockReturnValue(normalizedConfig);
  });

  it("forwards pipeline warnings in buildStart", async () => {
    pipelineMock.mockResolvedValue({
      artifacts: [],
      warnings: ["warning one"],
    });

    const plugin = siteIndexPlugin({ siteUrl: "https://example.com" });
    const warn = vi.fn();

    await callBuildStart(plugin, { warn });

    expect(pipelineMock).toHaveBeenCalledWith(normalizedConfig);
    expect(warn).toHaveBeenCalledWith("warning one");
  });

  it("calls next when req.url is missing", () => {
    const plugin = siteIndexPlugin({ siteUrl: "https://example.com" });
    const middleware = captureMiddleware(plugin);
    const next = vi.fn();

    middleware({}, { setHeader: vi.fn(), end: vi.fn() }, next);

    expect(next).toHaveBeenCalled();
  });

  it("calls next when url has no cached artifact", async () => {
    pipelineMock.mockResolvedValue({
      artifacts: [{ path: "/sitemap.xml", content: "<index />" }],
      warnings: [],
    });

    const plugin = siteIndexPlugin({ siteUrl: "https://example.com" });
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
});

type Middleware = (
  req: { url?: string },
  res: {
    setHeader: ReturnType<typeof vi.fn>;
    end: ReturnType<typeof vi.fn>;
  },
  next: ReturnType<typeof vi.fn>,
) => void;

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

import path from "node:path";
import type { ViteDevServer } from "vite";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServerMock, loadConfigFromFileMock, mergeConfigMock } =
  vi.hoisted(() => ({
    createServerMock: vi.fn(),
    loadConfigFromFileMock: vi.fn(),
    mergeConfigMock: vi.fn(),
  }));

vi.mock("vite", () => ({
  createServer: createServerMock,
  loadConfigFromFile: loadConfigFromFileMock,
  mergeConfig: mergeConfigMock,
}));

import { resolveModuleLoaderContext } from "./context.js";

describe("resolveModuleLoaderContext", () => {
  beforeEach(() => {
    createServerMock.mockReset();
    loadConfigFromFileMock.mockReset();
    mergeConfigMock.mockReset();
    mergeConfigMock.mockImplementation((base, extra) => ({
      ...(base as Record<string, unknown>),
      ...(extra as Record<string, unknown>),
    }));
  });

  it("resolves configured Vite root relative to process cwd", async () => {
    const close = vi.fn().mockResolvedValue(undefined);
    const ssrLoadModule = vi.fn().mockResolvedValue({ ok: true });
    const server = {
      ssrLoadModule,
      close,
    } as unknown as ViteDevServer;

    loadConfigFromFileMock.mockResolvedValue({
      config: { root: "examples/ts-src" },
    });
    createServerMock.mockResolvedValue(server);

    const { moduleLoaderContext, dispose } = await resolveModuleLoaderContext();

    expect(moduleLoaderContext.root).toBe(
      path.resolve(process.cwd(), "examples/ts-src"),
    );

    await moduleLoaderContext.ssrLoadModule("/entry.site-index.ts");
    expect(ssrLoadModule).toHaveBeenCalledWith("/entry.site-index.ts");

    await dispose();
    expect(close).toHaveBeenCalledTimes(1);
  });
});

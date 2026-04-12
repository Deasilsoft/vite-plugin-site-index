import { siteIndexPlugin } from "@/plugin";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Plugin, ViteDevServer } from "vite";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { exampleScenario } from "./example.scenario.js";

const { getLastModifiedMapMock } = vi.hoisted(() => ({
  getLastModifiedMapMock: vi.fn(),
}));

vi.mock("@/domains/git", () => ({
  git: getLastModifiedMapMock,
}));

describe("fixture app scenarios", () => {
  const originalCwd = process.cwd();

  beforeEach(() => {
    getLastModifiedMapMock.mockReset();
  });

  afterEach(() => {
    process.chdir(originalCwd);
  });

  it(exampleScenario.name, async () => {
    getLastModifiedMapMock.mockResolvedValue(
      new Map(exampleScenario.mockedLastModifiedByFile),
    );

    process.chdir(exampleScenario.fixtureRoot);

    const plugin = siteIndexPlugin(exampleScenario.pluginOptions);
    const warn = vi.fn();

    await callBuildStart(plugin, { warn });
    expect(warn).not.toHaveBeenCalled();

    const emitFile = vi.fn();
    await callGenerateBundle(plugin, { emitFile });

    const emitted = collectEmittedAssets(emitFile);

    for (const expectedAsset of exampleScenario.expectedAssets) {
      const expectedContent = await readFixtureFile(
        exampleScenario.fixtureRoot,
        expectedAsset.expectedFile,
      );

      expect(emitted.get(expectedAsset.fileName)?.trimEnd()).toBe(
        expectedContent.trimEnd(),
      );
    }

    const middleware = captureMiddleware(plugin);
    const setHeader = vi.fn();
    const end = vi.fn();
    const next = vi.fn();

    middleware({ url: "/sitemap.xml" }, { setHeader, end }, next);

    expect(setHeader).toHaveBeenCalledWith("Content-Type", "application/xml");
    expect(end).toHaveBeenCalledWith(emitted.get("sitemap.xml"));
    expect(next).not.toHaveBeenCalled();
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

function collectEmittedAssets(
  emitFile: ReturnType<typeof vi.fn>,
): Map<string, string> {
  const assets = new Map<string, string>();

  for (const [asset] of emitFile.mock.calls as Array<
    [
      {
        type: "asset";
        fileName: string;
        source: string;
      },
    ]
  >) {
    assets.set(asset.fileName, asset.source);
  }

  return assets;
}

async function readFixtureFile(
  root: string,
  relativePath: string,
): Promise<string> {
  const filePath = path.resolve(root, relativePath);
  return readFile(filePath, "utf8");
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

async function callGenerateBundle(
  plugin: Plugin,
  context: { emitFile: ReturnType<typeof vi.fn> },
): Promise<void> {
  const generateBundle = getHookHandler<
    (this: { emitFile: ReturnType<typeof vi.fn> }) => void | Promise<void>
  >(plugin.generateBundle);

  await generateBundle.call(context);
}

import { beforeEach, describe, expect, it, vi } from "vitest";
import { runSiteIndexPipeline } from "../src/main.js";
import type {
  LoadedModule,
  Module,
  Options,
  ResolvedModule,
} from "../src/types.js";

const {
  discoverAllModulesMock,
  makeArtifactsMock,
  validateModulesMock,
  validateOptionsMock,
  validateSiteIndexesMock,
} = vi.hoisted(() => ({
  discoverAllModulesMock: vi.fn(),
  makeArtifactsMock: vi.fn(),
  validateModulesMock: vi.fn(),
  validateOptionsMock: vi.fn(),
  validateSiteIndexesMock: vi.fn(),
}));

vi.mock("../src/stages/discover.js", () => ({
  discoverAllModules: discoverAllModulesMock,
}));

vi.mock("../src/stages/generate.js", () => ({
  makeArtifacts: makeArtifactsMock,
}));

vi.mock("../src/stages/validateOptions.js", () => ({
  validateOptions: validateOptionsMock,
}));

vi.mock("../src/stages/validateModules.js", () => ({
  validateModules: validateModulesMock,
}));

vi.mock("../src/stages/validateSiteIndexes.js", () => ({
  validateSiteIndexes: validateSiteIndexesMock,
}));

describe("runSiteIndexPipeline", () => {
  beforeEach(() => {
    discoverAllModulesMock.mockReset();
    makeArtifactsMock.mockReset();
    validateModulesMock.mockReset();
    validateOptionsMock.mockReset();
    validateSiteIndexesMock.mockReset();
  });

  it("returns early when discovery finds no modules", async () => {
    const options = createOptions();
    const config = {
      siteUrl: "https://example.com",
      discoveryRoot: "/workspace/normalized",
    };

    validateOptionsMock.mockReturnValue(config);
    discoverAllModulesMock.mockResolvedValue([]);

    const result = await runSiteIndexPipeline(options);

    expect(validateOptionsMock).toHaveBeenCalledWith(options);
    expect(discoverAllModulesMock).toHaveBeenCalledWith(config.discoveryRoot);
    expect(options.loadDiscoveredModules).not.toHaveBeenCalled();
    expect(validateModulesMock).not.toHaveBeenCalled();
    expect(validateSiteIndexesMock).not.toHaveBeenCalled();
    expect(makeArtifactsMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      data: [],
      warnings: [{ message: "No modules found in: /workspace/normalized" }],
    });
  });

  it("wires stage outputs into the next stage and merges warnings", async () => {
    const options = createOptions();
    const config = {
      siteUrl: "https://example.com",
      discoveryRoot: "/workspace/normalized",
      loadDiscoveredModules: options.loadDiscoveredModules,
    };
    const discoveredModules: Module[] = [
      {
        filePath: "/workspace/normalized/about.site-index.ts",
        importId: "./about.site-index.ts",
      },
    ];
    const loadedModules: LoadedModule[] = [
      {
        module: discoveredModules[0],
        exports: {
          default: [{ url: "/about" }],
        },
      },
    ];
    const resolvedModules: ResolvedModule[] = [
      {
        module: discoveredModules[0],
        siteIndexes: [{ url: "/about" }],
      },
    ];

    validateOptionsMock.mockReturnValue(config);
    discoverAllModulesMock.mockResolvedValue(discoveredModules);
    options.loadDiscoveredModules.mockResolvedValue({
      data: loadedModules,
      warnings: [{ message: "load warning" }],
    });
    validateModulesMock.mockReturnValue({
      data: resolvedModules,
      warnings: [{ message: "module warning" }],
    });
    validateSiteIndexesMock.mockReturnValue({
      data: [{ url: "/about", sitemap: "pages", index: true }],
      warnings: [{ message: "validation warning" }],
    });
    makeArtifactsMock.mockReturnValue([
      { filePath: "sitemap.xml", content: "xml" },
    ]);

    const result = await runSiteIndexPipeline(options);

    expect(options.loadDiscoveredModules).toHaveBeenCalledWith(
      discoveredModules,
    );
    expect(validateModulesMock).toHaveBeenCalledWith(loadedModules);
    expect(validateSiteIndexesMock).toHaveBeenCalledWith(resolvedModules);
    expect(makeArtifactsMock).toHaveBeenCalledWith(config.siteUrl, [
      { url: "/about", sitemap: "pages", index: true },
    ]);
    expect(result.warnings).toEqual([
      { message: "load warning" },
      { message: "module warning" },
      { message: "validation warning" },
    ]);
  });

  it("propagates loader failures", async () => {
    const options = createOptions();
    const config = {
      siteUrl: "https://example.com",
      discoveryRoot: "/workspace/normalized",
      loadDiscoveredModules: options.loadDiscoveredModules,
    };
    const discoveredModules: Module[] = [
      {
        filePath: "/workspace/normalized/about.site-index.ts",
        importId: "./about.site-index.ts",
      },
    ];
    const error = new Error("load failed");

    validateOptionsMock.mockReturnValue(config);
    discoverAllModulesMock.mockResolvedValue(discoveredModules);
    options.loadDiscoveredModules.mockRejectedValue(error);

    await expect(runSiteIndexPipeline(options)).rejects.toThrow("load failed");
    expect(validateModulesMock).not.toHaveBeenCalled();
    expect(validateSiteIndexesMock).not.toHaveBeenCalled();
    expect(makeArtifactsMock).not.toHaveBeenCalled();
  });
});

function createOptions(): Options & {
  loadDiscoveredModules: ReturnType<
    typeof vi.fn<Options["loadDiscoveredModules"]>
  >;
} {
  const loadDiscoveredModules = vi.fn<Options["loadDiscoveredModules"]>();

  return {
    siteUrl: "https://example.com/",
    discoveryRoot: "/workspace",
    loadDiscoveredModules,
  };
}

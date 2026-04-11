import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateSiteArtifacts } from "../../../src/pipeline/generate-site-artifacts.js";

const {
  discoverSiteIndexModulesMock,
  loadSiteIndexModuleMock,
  getLastModifiedMapMock,
  renderSitemapIndexXmlMock,
  renderSitemapXmlMock,
  renderRobotsTxtMock,
} = vi.hoisted(() => ({
  discoverSiteIndexModulesMock: vi.fn(),
  loadSiteIndexModuleMock: vi.fn(),
  getLastModifiedMapMock: vi.fn(),
  renderSitemapIndexXmlMock: vi.fn(),
  renderSitemapXmlMock: vi.fn(),
  renderRobotsTxtMock: vi.fn(),
}));

vi.mock("../../../src/modules/discover-site-index-modules.js", () => ({
  discoverSiteIndexModules: discoverSiteIndexModulesMock,
}));

vi.mock("../../../src/modules/load-site-index-module.js", () => ({
  loadSiteIndexModule: loadSiteIndexModuleMock,
}));

vi.mock("../../../src/git/get-last-modified-map.js", () => ({
  getLastModifiedMap: getLastModifiedMapMock,
}));

vi.mock("../../../src/render/render-sitemap-index-xml.js", () => ({
  renderSitemapIndexXml: renderSitemapIndexXmlMock,
}));

vi.mock("../../../src/render/render-sitemap-xml.js", () => ({
  renderSitemapXml: renderSitemapXmlMock,
}));

vi.mock("../../../src/render/render-robots-txt.js", () => ({
  renderRobotsTxt: renderRobotsTxtMock,
}));

describe("generateSiteArtifacts", () => {
  beforeEach(() => {
    discoverSiteIndexModulesMock.mockReset();
    loadSiteIndexModuleMock.mockReset();
    getLastModifiedMapMock.mockReset();
    renderSitemapIndexXmlMock.mockReset();
    renderSitemapXmlMock.mockReset();
    renderRobotsTxtMock.mockReset();
  });

  it("generates sitemap.xml, leaf sitemaps, and robots.txt", async () => {
    discoverSiteIndexModulesMock.mockResolvedValueOnce([
      "/repo/src/about.site-index.ts",
      "/repo/src/blog.site-index.ts",
      "/repo/src/private.site-index.ts",
    ]);

    loadSiteIndexModuleMock
      .mockResolvedValueOnce({
        siteIndex: {
          url: "/about",
        },
      })
      .mockResolvedValueOnce({
        siteIndexes: [
          {
            url: "/blog",
            sitemap: "blog",
            lastModified: "2026-04-10T12:00:00.000Z",
          },
        ],
      })
      .mockResolvedValueOnce({
        siteIndex: {
          url: "/private",
          index: false,
        },
      });

    getLastModifiedMapMock.mockResolvedValueOnce(
      new Map<string, string>([
        ["/repo/src/about.site-index.ts", "2026-04-09T08:00:00.000Z"],
        ["/repo/src/private.site-index.ts", "2026-04-08T07:00:00.000Z"],
      ]),
    );

    renderSitemapXmlMock
      .mockReturnValueOnce("<pages-xml />")
      .mockReturnValueOnce("<blog-xml />");
    renderSitemapIndexXmlMock.mockReturnValueOnce("<index-xml />");
    renderRobotsTxtMock.mockReturnValueOnce("User-agent: *");

    const result = await generateSiteArtifacts({
      siteUrl: "https://example.com",
      include: ["src/**/site-index.ts", "src/**/*.site-index.ts"],
      exclude: [],
      userAgent: "*",
    });

    expect(discoverSiteIndexModulesMock).toHaveBeenCalledWith({
      siteUrl: "https://example.com",
      include: ["src/**/site-index.ts", "src/**/*.site-index.ts"],
      exclude: [],
      userAgent: "*",
    });

    expect(getLastModifiedMapMock).toHaveBeenCalledWith(
      [
        "/repo/src/about.site-index.ts",
        "/repo/src/blog.site-index.ts",
        "/repo/src/private.site-index.ts",
      ],
      [],
    );

    expect(renderSitemapXmlMock).toHaveBeenNthCalledWith(
      1,
      [
        {
          url: "/about",
          sitemap: "pages",
          index: true,
          lastModified: "2026-04-09T08:00:00.000Z",
        },
      ],
      "https://example.com",
    );

    expect(renderSitemapXmlMock).toHaveBeenNthCalledWith(
      2,
      [
        {
          url: "/blog",
          sitemap: "blog",
          index: true,
          lastModified: "2026-04-10T12:00:00.000Z",
        },
      ],
      "https://example.com",
    );

    expect(renderSitemapIndexXmlMock).toHaveBeenCalledWith(
      ["/sitemap-pages.xml", "/sitemap-blog.xml"],
      "https://example.com",
    );

    expect(renderRobotsTxtMock).toHaveBeenCalledWith({
      siteUrl: "https://example.com",
      userAgent: "*",
      disallowed: ["/private"],
    });

    expect(result).toEqual({
      artifacts: [
        {
          path: "/sitemap-pages.xml",
          content: "<pages-xml />",
        },
        {
          path: "/sitemap-blog.xml",
          content: "<blog-xml />",
        },
        {
          path: "/sitemap.xml",
          content: "<index-xml />",
        },
        {
          path: "/robots.txt",
          content: "User-agent: *",
        },
      ],
      warnings: [],
    });
  });

  it("groups multiple indexed entries into an existing sitemap bucket", async () => {
    discoverSiteIndexModulesMock.mockResolvedValueOnce([
      "/repo/src/about.site-index.ts",
      "/repo/src/contact.site-index.ts",
    ]);

    loadSiteIndexModuleMock
      .mockResolvedValueOnce({
        siteIndex: {
          url: "/about",
        },
      })
      .mockResolvedValueOnce({
        siteIndex: {
          url: "/contact",
        },
      });

    getLastModifiedMapMock.mockResolvedValueOnce(new Map());

    renderSitemapXmlMock.mockReturnValueOnce("<pages-xml />");
    renderSitemapIndexXmlMock.mockReturnValueOnce("<index-xml />");
    renderRobotsTxtMock.mockReturnValueOnce("User-agent: *");

    const result = await generateSiteArtifacts({
      siteUrl: "https://example.com",
      include: ["src/**/site-index.ts", "src/**/*.site-index.ts"],
      exclude: [],
      userAgent: "*",
    });

    expect(renderSitemapXmlMock).toHaveBeenCalledWith(
      [
        {
          url: "/about",
          sitemap: "pages",
          index: true,
        },
        {
          url: "/contact",
          sitemap: "pages",
          index: true,
        },
      ],
      "https://example.com",
    );

    expect(result.artifacts).toEqual([
      {
        path: "/sitemap-pages.xml",
        content: "<pages-xml />",
      },
      {
        path: "/sitemap.xml",
        content: "<index-xml />",
      },
      {
        path: "/robots.txt",
        content: "User-agent: *",
      },
    ]);
  });

  it("throws when a module has no extractable entries", async () => {
    discoverSiteIndexModulesMock.mockResolvedValueOnce([
      "/repo/src/invalid.site-index.ts",
    ]);

    loadSiteIndexModuleMock.mockResolvedValueOnce({});

    await expect(
      generateSiteArtifacts({
        siteUrl: "https://example.com",
        include: ["src/**/site-index.ts", "src/**/*.site-index.ts"],
        exclude: [],
        userAgent: "*",
      }),
    ).rejects.toThrow("Module must export siteIndex or siteIndexes");
  });

  it("throws when a module exports both siteIndex and siteIndexes", async () => {
    discoverSiteIndexModulesMock.mockResolvedValueOnce([
      "/repo/src/invalid.site-index.ts",
    ]);

    loadSiteIndexModuleMock.mockResolvedValueOnce({
      siteIndex: { url: "/a" },
      siteIndexes: [{ url: "/b" }],
    });

    await expect(
      generateSiteArtifacts({
        siteUrl: "https://example.com",
        include: ["src/**/site-index.ts", "src/**/*.site-index.ts"],
        exclude: [],
        userAgent: "*",
      }),
    ).rejects.toThrow("Module cannot export both siteIndex and siteIndexes");
  });

  it("throws on duplicate urls", async () => {
    discoverSiteIndexModulesMock.mockResolvedValueOnce([
      "/repo/src/a.site-index.ts",
      "/repo/src/b.site-index.ts",
    ]);

    loadSiteIndexModuleMock
      .mockResolvedValueOnce({
        siteIndex: {
          url: "/about",
        },
      })
      .mockResolvedValueOnce({
        siteIndex: {
          url: "/about",
        },
      });

    getLastModifiedMapMock.mockResolvedValueOnce(new Map());
    renderSitemapXmlMock.mockReturnValue("<xml />");
    renderSitemapIndexXmlMock.mockReturnValue("<index />");
    renderRobotsTxtMock.mockReturnValue("robots");

    await expect(
      generateSiteArtifacts({
        siteUrl: "https://example.com",
        include: ["src/**/site-index.ts", "src/**/*.site-index.ts"],
        exclude: [],
        userAgent: "*",
      }),
    ).rejects.toThrow("Duplicate url: /about");
  });

  it("throws on invalid sitemap names", async () => {
    discoverSiteIndexModulesMock.mockResolvedValueOnce([
      "/repo/src/invalid.site-index.ts",
    ]);

    loadSiteIndexModuleMock.mockResolvedValueOnce({
      siteIndex: {
        url: "/about",
        sitemap: "Blog_Posts",
      },
    });

    await expect(
      generateSiteArtifacts({
        siteUrl: "https://example.com",
        include: ["src/**/site-index.ts", "src/**/*.site-index.ts"],
        exclude: [],
        userAgent: "*",
      }),
    ).rejects.toThrow("Invalid sitemap name: Blog_Posts");
  });

  it("throws on invalid urls", async () => {
    discoverSiteIndexModulesMock.mockResolvedValueOnce([
      "/repo/src/invalid.site-index.ts",
    ]);

    loadSiteIndexModuleMock.mockResolvedValueOnce({
      siteIndex: {
        url: "about",
      },
    });

    await expect(
      generateSiteArtifacts({
        siteUrl: "https://example.com",
        include: ["src/**/site-index.ts", "src/**/*.site-index.ts"],
        exclude: [],
        userAgent: "*",
      }),
    ).rejects.toThrow("Invalid url: about");
  });
});

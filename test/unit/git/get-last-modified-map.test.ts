import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLastModifiedMap } from "../../../src/git/get-last-modified-map.js";

const { execSyncMock } = vi.hoisted(() => ({
  execSyncMock: vi.fn(),
}));

vi.mock("node:child_process", () => ({
  execSync: execSyncMock,
}));

describe("getLastModifiedMap", () => {
  beforeEach(() => {
    execSyncMock.mockReset();
  });

  it("returns git lastModified values for files", async () => {
    execSyncMock
      .mockReturnValueOnce(Buffer.from("2026-04-10T12:00:00.000Z\n"))
      .mockReturnValueOnce(Buffer.from("2026-04-11T09:30:00.000Z\n"));

    const warnings: string[] = [];

    const result = await getLastModifiedMap(
      ["/repo/src/about.site-index.ts", "/repo/src/blog.site-index.ts"],
      warnings,
    );

    expect(result.get("/repo/src/about.site-index.ts")).toBe(
      "2026-04-10T12:00:00.000Z",
    );
    expect(result.get("/repo/src/blog.site-index.ts")).toBe(
      "2026-04-11T09:30:00.000Z",
    );
    expect(warnings).toEqual([]);
  });

  it("adds a warning when git lookup fails", async () => {
    execSyncMock.mockImplementationOnce(() => {
      throw new Error("git failed");
    });

    const warnings: string[] = [];

    const result = await getLastModifiedMap(
      ["/repo/src/about.site-index.ts"],
      warnings,
    );

    expect(result.size).toBe(0);
    expect(warnings).toEqual([
      "Failed to resolve lastModified for /repo/src/about.site-index.ts",
    ]);
  });
});

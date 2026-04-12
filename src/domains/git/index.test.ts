import { git } from "@/domains/git";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { execFileMock } = vi.hoisted(() => ({
  execFileMock: vi.fn(),
}));

vi.mock("node:child_process", () => ({
  execFile: execFileMock,
}));

vi.mock("node:util", () => ({
  promisify:
    (fn: (...args: unknown[]) => unknown) =>
    (...args: unknown[]) =>
      fn(...args),
}));

describe("getLastModifiedMap", () => {
  beforeEach(() => {
    execFileMock.mockReset();
  });

  it("returns an empty map when no files are provided", async () => {
    const warnings: string[] = [];
    const result = await git([], warnings);

    expect(execFileMock).not.toHaveBeenCalled();
    expect(result.size).toBe(0);
    expect(warnings).toEqual([]);
  });

  it("adds a warning when git lookup fails", async () => {
    execFileMock.mockRejectedValueOnce(new Error("git failed"));

    const warnings: string[] = [];

    const result = await git(["/repo/src/about.site-index.ts"], warnings);

    expect(result.size).toBe(0);
    expect(warnings).toEqual([
      "Failed to resolve lastModified for /repo/src/about.site-index.ts",
    ]);
  });

  it("does not add a map entry or warning when git returns only whitespace", async () => {
    execFileMock.mockResolvedValueOnce({ stdout: "\n" });

    const warnings: string[] = [];

    const result = await git(["/repo/src/about.site-index.ts"], warnings);

    expect(result.has("/repo/src/about.site-index.ts")).toBe(false);
    expect(result.size).toBe(0);
    expect(warnings).toEqual([]);
  });
});

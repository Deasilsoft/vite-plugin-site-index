import { beforeEach, describe, expect, it, vi } from "vitest";

const { loggerErrorMock, runBuildCommandMock, runCheckCommandMock } =
  vi.hoisted(() => ({
    loggerErrorMock: vi.fn(),
    runBuildCommandMock: vi.fn(async () => undefined),
    runCheckCommandMock: vi.fn(async () => undefined),
  }));

vi.mock("../src/build/build.js", () => ({
  runBuildCommand: runBuildCommandMock,
}));

vi.mock("../src/check/check.js", () => ({
  runCheckCommand: runCheckCommandMock,
}));

vi.mock("../src/logger/logger.js", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: loggerErrorMock,
  },
}));

const { main } = await import("../src/main.js");

describe("site-index CLI", () => {
  beforeEach(() => {
    process.exitCode = undefined;
    loggerErrorMock.mockReset();
    runBuildCommandMock.mockReset();
    runCheckCommandMock.mockReset();
    runBuildCommandMock.mockResolvedValue(undefined);
    runCheckCommandMock.mockResolvedValue(undefined);
  });

  it("shows help when invoked without a command", async () => {
    await expect(main(["node", "site-index"])).resolves.toBeUndefined();
    expect(runBuildCommandMock).not.toHaveBeenCalled();
    expect(runCheckCommandMock).not.toHaveBeenCalled();
  });

  it("delegates build command execution to build/build.ts", async () => {
    await expect(
      main([
        "node",
        "site-index",
        "build",
        "--site-url",
        "https://example.com",
        "--root",
        "/repo",
        "--out-dir",
        "public",
        "--config",
        "vite.custom.ts",
        "--mode",
        "production",
      ]),
    ).resolves.toBeUndefined();

    expect(runBuildCommandMock).toHaveBeenCalledWith({
      root: "/repo",
      siteUrl: "https://example.com",
      outDir: "public",
      config: "vite.custom.ts",
      mode: "production",
    });
  });

  it("delegates check command execution to check/check.ts", async () => {
    await expect(
      main([
        "node",
        "site-index",
        "check",
        "--site-url",
        "https://example.com",
        "--root",
        "/repo",
        "--config",
        "vite.custom.ts",
        "--mode",
        "ci",
      ]),
    ).resolves.toBeUndefined();

    expect(runCheckCommandMock).toHaveBeenCalledWith({
      root: "/repo",
      siteUrl: "https://example.com",
      config: "vite.custom.ts",
      mode: "ci",
    });
  });

  it("prints a concise error by default", async () => {
    await expect(
      main(["node", "site-index", "check"]),
    ).resolves.toBeUndefined();

    expect(loggerErrorMock).toHaveBeenCalledWith(
      "Missing required option: --site-url <url>",
    );
    expect(process.exitCode).toBe(1);
  });

  it("prints stack details with --verbose", async () => {
    await expect(
      main(["node", "site-index", "check", "--verbose"]),
    ).resolves.toBeUndefined();

    expect(loggerErrorMock).toHaveBeenCalledOnce();
    expect(String(loggerErrorMock.mock.calls[0]?.[0])).toContain(
      "Error: Missing required option: --site-url <url>",
    );
    expect(process.exitCode).toBe(1);
  });
});

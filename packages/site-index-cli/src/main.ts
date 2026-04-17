import { cac } from "cac";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { setupBuildCommand } from "./build/command.js";
import { setupCheckCommand } from "./check/command.js";
import { getExitCode, logCliError } from "./logger/errors.js";
import { setupMakeCommand } from "./make/command.js";
import type { PackageJsonWithVersion } from "./types.js";

function isVerbose(argv: string[]): boolean {
  return argv.includes("--verbose");
}

async function getCliVersion(): Promise<string> {
  const packageJsonPath = fileURLToPath(
    new URL("../package.json", import.meta.url),
  );

  const packageJson = await fs.readFile(packageJsonPath, "utf8");
  const parsed = JSON.parse(packageJson) as PackageJsonWithVersion;

  if (typeof parsed.version !== "string") {
    throw new Error('Invalid package.json: missing string "version" field.');
  }

  return parsed.version;
}

export async function main(argv: string[] = process.argv): Promise<void> {
  const cli = cac("site-index");

  cli.option("--verbose", "Show full error details");

  setupBuildCommand(cli);
  setupCheckCommand(cli);
  setupMakeCommand(cli);

  cli.help();
  cli.version(await getCliVersion());

  if (argv.length <= 2) {
    cli.outputHelp();

    return;
  }

  try {
    cli.parse(argv, { run: false });

    await cli.runMatchedCommand();
  } catch (error) {
    logCliError(error, isVerbose(argv));

    process.exitCode = getExitCode(error);
  }
}

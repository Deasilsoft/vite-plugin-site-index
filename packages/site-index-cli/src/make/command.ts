import type { CAC } from "cac";
import type { MakeCommandCliOptions } from "../types.js";
import { runMakeCommand } from "./make.js";

export function setupMakeCommand(cli: CAC): void {
  cli
    .command("make <name>", "Create a new *.site-index.ts module")
    .option("--dir <dir>", "Target directory", {
      default: "src",
    })
    .option("--force", "Overwrite if the file already exists", {
      default: false,
    })
    .action((name: string, options: MakeCommandCliOptions) =>
      runMakeCommand({
        name,
        dir: options.dir,
        force: options.force,
      }),
    );
}

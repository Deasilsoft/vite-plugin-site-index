import type { CAC } from "cac";
import type { BuildCommandCliOptions } from "../types.js";
import { runBuild } from "./run.js";

export function setupBuildCommand(cli: CAC): void {
  cli
    .command("build", "Generate artifacts using the Vite config")
    .option("--site-url <url>", "Site URL used for absolute sitemap links")
    .option("--config <path>", "Path to vite config")
    .option("--root <path>", "Project root", {
      default: process.cwd(),
    })
    .option("--out-dir <dir>", "Output directory (relative to root)", {
      default: "dist",
    })
    .option("--mode <mode>", "Vite mode")
    .action(async (options: BuildCommandCliOptions) => {
      if (!options.siteUrl) {
        throw new Error("Missing required option: --site-url <url>");
      }

      await runBuild({
        root: options.root,
        siteUrl: options.siteUrl,
        config: options.config,
        mode: options.mode,
        outDir: options.outDir,
      });
    });
}

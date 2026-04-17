import type { CAC } from "cac";
import type { CheckCommandCliOptions } from "../types.js";
import { runCheck } from "./run.js";

export function setupCheckCommand(cli: CAC): void {
  cli
    .command("check", "Validate site-index modules for CI")
    .option("--site-url <url>", "Site URL used for absolute sitemap links")
    .option("--config <path>", "Path to vite config")
    .option("--root <path>", "Project root", {
      default: process.cwd(),
    })
    .option("--mode <mode>", "Vite mode")
    .action(async (options: CheckCommandCliOptions) => {
      if (!options.siteUrl) {
        throw new Error("Missing required option: --site-url <url>");
      }

      await runCheck({
        root: options.root,
        siteUrl: options.siteUrl,
        config: options.config,
        mode: options.mode,
      });
    });
}

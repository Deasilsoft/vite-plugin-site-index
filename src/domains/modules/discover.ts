import type { ResolvedConfig } from "@/shared/types.js";
import { glob } from "tinyglobby";

export async function discoverModules(
  config: ResolvedConfig,
): Promise<string[]> {
  return glob(config.include, {
    cwd: process.cwd(),
    ignore: config.exclude,
    absolute: true,
  });
}

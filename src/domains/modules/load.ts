import { bundleRequire } from "bundle-require";
import path from "node:path";

export async function loadModules(file: string): Promise<unknown> {
  const { mod } = await bundleRequire({
    filepath: path.resolve(file),
  });

  return mod;
}

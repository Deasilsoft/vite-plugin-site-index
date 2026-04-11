import path from "node:path";
import { bundleRequire } from "bundle-require";

export async function loadSiteIndexModule(file: string): Promise<unknown> {
  const { mod } = await bundleRequire({
    filepath: path.resolve(file),
  });

  return mod;
}

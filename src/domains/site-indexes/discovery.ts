import { glob } from "tinyglobby";

const SUPPORTED_EXTENSIONS = [".ts", ".js", ".mjs"];

export async function findSiteIndexFiles(root: string): Promise<string[]> {
  const patterns = SUPPORTED_EXTENSIONS.map((ext) => `**/*.site-index${ext}`);

  const files = await glob(patterns, {
    cwd: root,
    absolute: true,
    onlyFiles: true,
    dot: false,
  });

  files.sort((a, b) => a.localeCompare(b));

  return files;
}

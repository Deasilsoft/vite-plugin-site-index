import type { Module } from "../types.js";
import path from "node:path";
import { glob } from "tinyglobby";

const SUPPORTED_EXTENSIONS = [".ts", ".js", ".mjs"] as const;

const SITE_INDEX_PATTERNS = SUPPORTED_EXTENSIONS.map(
  (extension) => `**/*.site-index${extension}`,
);

const IGNORED_PATHS = [
  "**/node_modules/**",
  "**/dist/**",
  "**/coverage/**",
  "**/.git/**",
];

function makeModule(root: string, filePath: string): Module {
  const relativePath = path.relative(root, filePath);
  const posixPath = relativePath.split(path.sep).join("/");

  return {
    filePath,
    importId: `./${posixPath}`,
  };
}

export async function discoverAllModules(root: string): Promise<Module[]> {
  const filePaths = await glob(SITE_INDEX_PATTERNS, {
    cwd: root,
    absolute: true,
    onlyFiles: true,
    dot: false,
    ignore: IGNORED_PATHS,
  });

  filePaths.sort((a, b) => a.localeCompare(b));

  return filePaths.map((filePath) => makeModule(root, filePath));
}

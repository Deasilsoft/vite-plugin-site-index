import nodePlop from "node-plop";
import fs from "node:fs/promises";
import path from "node:path";

import register from "./plopfile.js";

type ScaffoldOptions = {
  name: string;
  dir?: string;
  force?: boolean;
};

type PlopFailure = {
  error?: unknown;
};

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.stat(filePath);

    return true;
  } catch (error) {
    const err = error as NodeJS.ErrnoException;

    if (err.code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

function throwIfFailure(failure: unknown): void {
  if (!failure) {
    return;
  }

  const error = (failure as PlopFailure).error;

  if (typeof error === "string") {
    throw new Error(error);
  }

  throw new Error("Scaffold failed");
}

export async function scaffoldSiteIndexFile(
  options: ScaffoldOptions,
): Promise<{ filePath: string }> {
  const dir = options.dir ?? "src";
  const fileName = `${options.name}.site-index.ts`;
  const filePath = path.resolve(process.cwd(), dir, fileName);

  if ((await fileExists(filePath)) && !options.force) {
    throw new Error(
      `Refusing to overwrite existing file: ${filePath} (use --force)`,
    );
  }

  const plop = await nodePlop(undefined, {
    destBasePath: process.cwd(),
    force: !!options.force,
  });

  register(plop);

  const generator = plop.getGenerator("site-index");

  const result = await generator.runActions({
    filePath,
    lastModified: new Date().toISOString(),
  });

  throwIfFailure(result.failures[0]);

  return { filePath };
}

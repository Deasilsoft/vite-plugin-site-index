import nodePlop from "node-plop";
import path from "node:path";
import { logger } from "../logger/logger.js";
import type { MakeOptions, MakeResult, PlopFailure } from "../types.js";
import { fileExists } from "../utils/fs.js";
import register from "./plopfile.js";

function throwIfFailure(failure: unknown): void {
  if (!failure) {
    return;
  }

  const error = (failure as PlopFailure).error;

  if (typeof error === "string") {
    throw new Error(error);
  }

  throw new Error("Make failed");
}

export async function runMakeCommand(
  options: MakeOptions,
): Promise<MakeResult> {
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
  logger.info(filePath);

  return { filePath };
}

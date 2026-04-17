import { logger } from "./logger.js";

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasStringMessage(value: unknown): value is { message: string } {
  return isObjectRecord(value) && typeof value.message === "string";
}

function hasStringStack(value: unknown): value is { stack: string } {
  return isObjectRecord(value) && typeof value.stack === "string";
}

function hasNumericExitCode(value: unknown): value is { exitCode: number } {
  return isObjectRecord(value) && typeof value.exitCode === "number";
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (hasStringMessage(error)) {
    return error.message;
  }

  return String(error);
}

export function getExitCode(error: unknown): number {
  if (hasNumericExitCode(error)) {
    return error.exitCode;
  }

  return 1;
}

export function logCliError(error: unknown, verbose: boolean): void {
  if (!verbose) {
    logger.error(getErrorMessage(error));
    return;
  }

  if (hasStringStack(error)) {
    logger.error(error.stack);
    return;
  }

  logger.error(getErrorMessage(error));
}

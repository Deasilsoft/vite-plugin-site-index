import type { Warning } from "site-index";
import { logger } from "./logger.js";

export function logWarnings(warnings: Warning[]): void {
  for (const warning of warnings) {
    logger.warn(`Warning: ${warning.message}`);

    if (warning.filePath) {
      logger.warn(`  at ${warning.filePath}`);
    }
  }
}

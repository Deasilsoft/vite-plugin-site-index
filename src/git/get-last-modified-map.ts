import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const LAST_MODIFIED_CONCURRENCY = 8;

async function mapWithConcurrencyLimit(
  files: string[],
  limit: number,
  mapper: (file: string) => Promise<void>,
): Promise<void> {
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < files.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      await mapper(files[currentIndex]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, files.length) }, () => worker()),
  );
}

export async function getLastModifiedMap(
  files: string[],
  warnings: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();

  await mapWithConcurrencyLimit(
    files,
    LAST_MODIFIED_CONCURRENCY,
    async (file) => {
      try {
        const { stdout } = await execFileAsync(
          "git",
          ["log", "-1", "--format=%cI", "--", file],
          {
            stdio: ["ignore", "pipe", "ignore"],
          },
        );
        const output = stdout.trim();

        if (output) map.set(file, output);
      } catch {
        warnings.push(`Failed to resolve lastModified for ${file}`);
      }
    },
  );

  return map;
}

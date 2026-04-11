import { execFileSync } from "node:child_process";

export async function getLastModifiedMap(
  files: string[],
  warnings: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();

  for (const file of files) {
    try {
      const output = execFileSync("git", ["log", "-1", "--format=%cI", "--", file], {
        stdio: ["ignore", "pipe", "ignore"],
      })
        .toString()
        .trim();

      if (output) map.set(file, output);
    } catch {
      warnings.push(`Failed to resolve lastModified for ${file}`);
    }
  }

  return map;
}

import fs from "node:fs/promises";
import path from "node:path";
import type { Artifact } from "site-index";

export async function writeArtifacts(
  outDir: string,
  artifacts: Artifact[],
): Promise<void> {
  for (const artifact of artifacts) {
    const filePath = path.join(outDir, artifact.filePath.replace(/^\//, ""));
    const directory = path.dirname(filePath);

    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(filePath, artifact.content, "utf8");
  }
}

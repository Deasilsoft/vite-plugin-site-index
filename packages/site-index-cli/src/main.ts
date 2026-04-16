import { cac } from "cac";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  runSiteIndexPipeline,
  type Artifact,
  type LoadedModule,
  type Module,
  type Warning,
} from "site-index";
import { createServer, type InlineConfig } from "vite";
import { scaffoldSiteIndexFile } from "./scaffold/scaffold.js";

async function getCliVersion(): Promise<string> {
  const packageJsonPath = fileURLToPath(
    new URL("../../package.json", import.meta.url),
  );

  const packageJson = await fs.readFile(packageJsonPath, "utf8");
  const parsed = JSON.parse(packageJson) as {
    version?: unknown;
  };

  if (typeof parsed.version !== "string") {
    throw new Error('Invalid package.json: missing string "version" field.');
  }

  return parsed.version;
}

async function runBuildCommand(
  rootArg: string,
  siteUrl: string,
  configFile?: string,
  mode?: string,
  outDirArg = "dist",
): Promise<void> {
  const root = path.resolve(rootArg);
  const outDir = path.resolve(root, outDirArg);
  const serverConfig: InlineConfig = {
    root,
    appType: "custom",
    server: {
      middlewareMode: true,
    },
  };

  if (configFile !== undefined) {
    serverConfig.configFile = configFile;
  }

  if (mode !== undefined) {
    serverConfig.mode = mode;
  }

  const viteServer = await createServer(serverConfig);

  try {
    const result = await runSiteIndexPipeline({
      siteUrl,
      discoveryRoot: root,
      loadDiscoveredModules: makeViteModuleLoader((id) =>
        viteServer.ssrLoadModule(id),
      ),
    });

    logWarnings(result.warnings);
    await writeArtifacts(outDir, result.data);
  } finally {
    await viteServer.close();
  }
}

function makeViteModuleLoader(ssrLoadModule: (id: string) => Promise<unknown>) {
  return async (modules: Module[]) => {
    const data: LoadedModule[] = [];
    const warnings: Warning[] = [];

    for (const module of modules) {
      try {
        const exports = (await ssrLoadModule(
          module.importId,
        )) as LoadedModule["exports"];

        data.push({
          module,
          exports,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        warnings.push({
          message: `Failed to load module: ${message}`,
          filePath: module.filePath,
        });
      }
    }

    return { data, warnings };
  };
}

async function writeArtifacts(
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

function logWarnings(warnings: Warning[]): void {
  for (const warning of warnings) {
    console.warn(`Warning: ${warning.message}`);

    if (warning.filePath) {
      console.warn(`  at ${warning.filePath}`);
    }
  }
}

async function runScaffoldCommand(
  name: string,
  options: {
    dir: string;
    force: boolean;
  },
): Promise<void> {
  const result = await scaffoldSiteIndexFile({
    name,
    dir: options.dir,
    force: options.force,
  });

  console.log(result.filePath);
}

export async function main(argv: string[] = process.argv): Promise<void> {
  const cli = cac("site-index");

  cli
    .command("build", "Generate artifacts using the Vite config")
    .option("--site-url <url>", "Site URL used for absolute sitemap links")
    .option("--config <path>", "Path to vite config")
    .option("--root <path>", "Project root", {
      default: process.cwd(),
    })
    .option("--out-dir <dir>", "Output directory (relative to root)", {
      default: "dist",
    })
    .option("--mode <mode>", "Vite mode")
    .action(
      async (options: {
        root: string;
        siteUrl?: string;
        config?: string;
        mode?: string;
        outDir: string;
      }) => {
        if (!options.siteUrl) {
          throw new Error("Missing required option: --site-url <url>");
        }

        await runBuildCommand(
          options.root,
          options.siteUrl,
          options.config,
          options.mode,
          options.outDir,
        );
      },
    );

  cli
    .command("scaffold <name>", "Create a new *.site-index.ts module")
    .option("--dir <dir>", "Target directory", {
      default: "src",
    })
    .option("--force", "Overwrite if the file already exists", {
      default: false,
    })
    .action(runScaffoldCommand);

  cli.help();
  cli.version(await getCliVersion());
  cli.parse(argv, { run: true });
}

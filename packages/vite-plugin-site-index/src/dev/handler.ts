import type { ViteDevServer } from "vite";
import type {
  ArtifactsGetter,
  ArtifactsRef,
  FileWatcher,
  Middleware,
  NotReadyHandler,
  RefreshFn,
  RefreshFromDevServer,
  RefreshRunnerState,
} from "./types.js";
import {
  contentTypeForArtifactPath,
  isArtifactUrl,
  isHeadMethod,
  isSiteIndexFile,
  watchEvents,
} from "./utils.js";

function createArtifactsMiddleware(
  getArtifacts: ArtifactsGetter,
  opts?: {
    onNotReady?: NotReadyHandler;
  },
): Middleware {
  return async (req, res, next) => {
    const { url } = req;

    if (!url || !isArtifactUrl(url)) return next();

    const artifacts = getArtifacts();

    if (!artifacts) {
      if (!opts?.onNotReady) return next();
      await opts.onNotReady(req, res);
      return;
    }

    const artifact = artifacts.find((a) => a.filePath === url);

    if (!artifact) return next();

    res.setHeader(
      "Content-Type",
      contentTypeForArtifactPath(artifact.filePath),
    );
    res.statusCode = 200;

    if (isHeadMethod(req.method)) {
      res.end();

      return;
    }

    res.end(artifact.content);
  };
}

function createQueuedRefreshRunner(refresh: RefreshFn): {
  refresh: () => Promise<void>;
  getState: () => RefreshRunnerState;
} {
  let inFlight: Promise<void> | null = null;
  let needsRerun = false;

  async function run(): Promise<void> {
    while (true) {
      needsRerun = false;

      await refresh();

      if (!needsRerun) return;
    }
  }

  function refreshQueued(): Promise<void> {
    if (inFlight) {
      needsRerun = true;

      return inFlight;
    }

    inFlight = run().finally(() => {
      inFlight = null;
    });

    return inFlight;
  }

  return {
    refresh: refreshQueued,
    getState: () => ({ inFlight: inFlight !== null }),
  };
}

function watchSiteIndexFiles(
  watcher: FileWatcher,
  onChange: () => void | Promise<void>,
): void {
  function handler(file: string): void {
    if (!isSiteIndexFile(file)) return;
    void onChange();
  }

  for (const event of watchEvents()) {
    watcher.on(event, handler);
  }
}

export function configureSiteIndexServer(
  server: ViteDevServer,
  artifactsRef: ArtifactsRef,
  refreshFromDevServer: RefreshFromDevServer,
): void {
  function logError(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    server.config.logger.error(`[vite-plugin-site-index] ${message}`);
  }

  async function runRefresh(): Promise<void> {
    try {
      await refreshFromDevServer(server);
    } catch (error) {
      logError(error);
    }
  }

  const refreshRunner = createQueuedRefreshRunner(runRefresh);

  void refreshRunner.refresh();

  watchSiteIndexFiles(server.watcher, () => refreshRunner.refresh());

  server.middlewares.use(
    createArtifactsMiddleware(() => artifactsRef.artifacts) as unknown as (
      req: unknown,
      res: unknown,
      next: (err?: unknown) => void,
    ) => void,
  );
}

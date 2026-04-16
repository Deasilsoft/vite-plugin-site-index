import type { ViteDevServer } from "vite";
import { configureSiteIndexServer } from "../dev/index.js";
import type { ArtifactsRef, RefreshFromDevServer } from "../dev/types.js";

export function createViteDevProvisioner(options: {
  server: ViteDevServer;
  artifactsRef: ArtifactsRef;
  refresh: RefreshFromDevServer;
}): void {
  configureSiteIndexServer(
    options.server,
    options.artifactsRef,
    options.refresh,
  );
}

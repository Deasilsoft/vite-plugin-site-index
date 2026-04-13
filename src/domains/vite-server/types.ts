import type { Artifact } from "@/domains/artifacts";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { ViteDevServer } from "vite";

export type ArtifactsRef = { current: Artifact[] };

export type RefreshFromDevServer = (server: ViteDevServer) => Promise<void>;

export type Middleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: (err?: unknown) => void,
) => void | Promise<void>;

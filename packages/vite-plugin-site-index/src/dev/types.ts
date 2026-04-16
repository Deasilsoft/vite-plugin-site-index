import type { Artifact } from "site-index";
import type { ViteDevServer } from "vite";

export type RequestLike = {
  url?: string;
  method?: string;
};

export type ResponseLike = {
  setHeader: (name: string, value: string) => void;
  end: (body?: string) => void;
  statusCode: number;
};

export type ArtifactsGetter = () => ReadonlyArray<Artifact> | null;

export type NotReadyHandler = (
  req: RequestLike,
  res: ResponseLike,
) => void | Promise<void>;

export type Middleware = (
  req: RequestLike,
  res: ResponseLike,
  next: (err?: unknown) => void,
) => void | Promise<void>;

export type RefreshRunnerState = { inFlight: boolean };
export type RefreshFn = () => Promise<void>;

export type FileWatcher = {
  on: (event: "add" | "change" | "unlink", cb: (file: string) => void) => void;
};

export type ArtifactsRef = {
  artifacts: ReadonlyArray<Artifact> | null;
};

export type RefreshFromDevServer = (server: ViteDevServer) => Promise<void>;

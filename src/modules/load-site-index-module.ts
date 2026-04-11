import path from "node:path";
import { pathToFileURL } from "node:url";

export async function loadSiteIndexModule(file: string): Promise<unknown> {
  const url = pathToFileURL(path.resolve(file)).href;
  return import(url);
}

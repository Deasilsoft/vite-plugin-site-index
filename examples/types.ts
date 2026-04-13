import type { Options } from "vite-plugin-site-index";

export type Scenario = {
  name: string;
  root: string;
  pluginOptions: Options;
  expectedFiles: string[];
};

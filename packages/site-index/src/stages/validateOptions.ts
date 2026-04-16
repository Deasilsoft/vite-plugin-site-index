import { z } from "zod";
import type { Options } from "../types.js";

const trimTrailingSlashes = (url: string): string => {
  return url.trim().replace(/\/+$/, "");
};

const OptionsSchema = z.object({
  siteUrl: z
    .url({
      protocol: /^https?$/,
      hostname: z.regexes.domain,
    })
    .transform(trimTrailingSlashes),
  discoveryRoot: z.string().trim().min(1),
  loadDiscoveredModules: z.custom<Options["loadDiscoveredModules"]>(
    (value) => typeof value === "function",
    "loadDiscoveredModules must be a function",
  ),
});

type Config = z.infer<typeof OptionsSchema>;

export function validateOptions(options: Options): Config {
  return OptionsSchema.parse(options);
}

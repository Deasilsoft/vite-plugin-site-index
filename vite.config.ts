import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export function resolveAliasPath(dir: string) {
  const base = import.meta.url;
  const url = new URL(dir, base);

  return fileURLToPath(url);
}

export default defineConfig({
  resolve: {
    alias: {
      "@": resolveAliasPath("src"),
    },
  },
  build: {
    lib: {
      entry: path.resolve("src/index.ts"),
      formats: ["es"],
      fileName: () => "index.js",
    },
    sourcemap: true,
    rolldownOptions: {
      external: [/^node:/, "vite", "tinyglobby"],
    },
  },
  plugins: [
    dts({
      entryRoot: "src",
      outDir: "dist",
      include: ["src/**/*.ts"],
      exclude: ["**/*.test.ts"],
      insertTypesEntry: false,
      rollupTypes: false,
    }),
  ],
});

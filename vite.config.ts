import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const srcDir = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": srcDir,
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
      external: [/^node:/, "vite", "bundle-require", "tinyglobby"],
    },
  },
  plugins: [
    dts({
      entryRoot: "src",
      outDir: "dist",
      include: ["src"],
      exclude: ["src/**/*.test.ts"],
      insertTypesEntry: false,
      rollupTypes: false,
    }),
  ],
});

import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const srcDir = fileURLToPath(new URL("../../src", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": srcDir,
    },
  },
});

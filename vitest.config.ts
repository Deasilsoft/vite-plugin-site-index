import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "site-index": fileURLToPath(
        new URL("./packages/site-index/src/index.ts", import.meta.url),
      ),
      "site-index-cli": fileURLToPath(
        new URL("./packages/site-index-cli/src/index.ts", import.meta.url),
      ),
      "vite-plugin-site-index": fileURLToPath(
        new URL(
          "./packages/vite-plugin-site-index/src/index.ts",
          import.meta.url,
        ),
      ),
    },
  },
  test: {
    root: fileURLToPath(new URL(".", import.meta.url)),
    environment: "node",
    passWithNoTests: true,
    projects: [
      {
        test: {
          name: "site-index",
          include: ["packages/site-index/test/**/*.test.ts"],
        },
      },
      {
        test: {
          name: "site-index-cli",
          include: ["packages/site-index-cli/test/**/*.test.ts"],
        },
      },
      {
        test: {
          name: "vite-plugin-site-index",
          include: ["packages/vite-plugin-site-index/test/**/*.test.ts"],
        },
      },
      {
        test: {
          name: "scenarios",
          include: ["tests/scenarios/**/*.test.ts"],
        },
      },
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      reportsDirectory: fileURLToPath(new URL("./coverage", import.meta.url)),
      include: [
        "packages/site-index/src/**/*.ts",
        "packages/site-index-cli/src/**/*.ts",
        "packages/vite-plugin-site-index/src/**/*.ts",
      ],
      exclude: ["**/*.test.ts", "**/*.d.ts"],
    },
  },
});

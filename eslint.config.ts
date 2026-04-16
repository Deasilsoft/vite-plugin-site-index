import js from "@eslint/js";
import { type Config, defineConfig } from "eslint/config";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";

const tsconfigRootDir = fileURLToPath(new URL(".", import.meta.url));

function toArray(value: Config | Config[]): Config[] {
  return Array.isArray(value) ? value : [value];
}

function scopeToFiles(configs: Config | Config[], files: string[]): Config[] {
  return toArray(configs).map((config) => ({
    ...config,
    files,
  }));
}

function createPackageConfig(packageName: string): Config[] {
  return [
    ...scopeToFiles(tseslint.configs.recommended, [
      `packages/${packageName}/src/**/*.ts`,
    ]),
    ...scopeToFiles(tseslint.configs.recommendedTypeChecked, [
      `packages/${packageName}/src/**/*.ts`,
    ]),
    {
      files: [`packages/${packageName}/src/**/*.ts`],
      languageOptions: {
        parserOptions: {
          tsconfigRootDir,
          projectService: true,
        },
      },
    },
    ...scopeToFiles(tseslint.configs.recommended, [
      `packages/${packageName}/test/**/*.ts`,
    ]),
    ...scopeToFiles(tseslint.configs.disableTypeChecked, [
      `packages/${packageName}/test/**/*.ts`,
    ]),
  ];
}

export default defineConfig(
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/coverage/**"],
  },
  js.configs.recommended,
  ...createPackageConfig("site-index"),
  ...createPackageConfig("site-index-cli"),
  ...createPackageConfig("vite-plugin-site-index"),
  ...scopeToFiles(tseslint.configs.recommended, [
    "**/tests/**/*.ts",
    "**/examples/**/*.ts",
    "**/*.config.ts",
  ]),
  {
    files: ["**/tests/**/*.ts", "**/examples/**/*.ts", "**/*.config.ts"],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir,
      },
    },
  },
  ...scopeToFiles(tseslint.configs.disableTypeChecked, [
    "**/tests/**/*.ts",
    "**/examples/**/*.ts",
    "**/*.config.ts",
  ]),
);

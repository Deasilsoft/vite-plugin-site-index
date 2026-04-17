import type { NodePlopAPI } from "node-plop";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const file = path.resolve(dir, "../templates/site-index.hbs");

export default function register(plop: NodePlopAPI) {
  plop.setGenerator("site-index", {
    prompts: [],
    actions: [
      {
        type: "add",
        path: "{{filePath}}",
        templateFile: file,
        skipIfExists: true,
      },
    ],
  });
}

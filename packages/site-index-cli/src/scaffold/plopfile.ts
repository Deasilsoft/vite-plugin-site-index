import type { NodePlopAPI } from "node-plop";

export default function register(plop: NodePlopAPI) {
  plop.setGenerator("site-index", {
    prompts: [],
    actions: [
      {
        type: "add",
        path: "{{filePath}}",
        templateFile: "templates/site-index.hbs",
        skipIfExists: true,
      },
    ],
  });
}

import type { CodegenConfig } from "@graphql-codegen/cli";
import { fileURLToPath } from "node:url";

const schemaUrl = fileURLToPath(new URL("../Tests/Infrastructure/ServerTests.Introspection.approved.graphql", import.meta.url));

const config: CodegenConfig = {
  schema: [{ [schemaUrl]: { handleAsSDL: true } }],
  documents: "./src/**/!(*.g).{ts,tsx}",
  ignoreNoDocuments: true,
  generates: {
    [`./src/gql/`]: {
      preset: "client",
      presetConfig: {
        fragmentMasking: false,
      },
      plugins: ["@shane32/graphql-codegen-near-operation-file-plugin"],
      config: {
        documentMode: "string",
        useTypeImports: true,
        enumType: "const",
        scalars: {
          DateOnly: "string",
          DateTimeOffset: "string",
          Decimal: "number",
          TimeOnly: "string",
          Uri: "string",
        },
        strictScalars: true,
        skipTypename: true,
      },
    },
    ["./schema.g.graphql"]: {
      plugins: ["schema-ast"],
      config: {
        includeDirectives: true,
      },
    },
  },
  errorsOnly: true,
};

export default config;

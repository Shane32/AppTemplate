import type { CodegenConfig } from "@graphql-codegen/cli";
import * as path from "path";

const schemaUrl = path.resolve(__dirname, "../Tests/Infrastructure/ServerTests.Introspection.approved.graphql");

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

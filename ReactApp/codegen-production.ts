import type { CodegenConfig } from "@graphql-codegen/cli";
import type { Types } from "@graphql-codegen/plugin-helpers";
import { parse } from "graphql";
import { createHash } from "crypto";
import config from "./codegen";

const gqlOutput = config.generates["./src/gql/"] as Types.ConfiguredOutput;

const configProduction: CodegenConfig = {
  ...config,
  generates: {
    ...config.generates,
    [`./src/gql/`]: {
      ...gqlOutput,
      presetConfig: {
        ...gqlOutput.presetConfig,
        // === to disable persisted queries, comment out the following block ===
        persistedDocuments: {
          mode: "replaceDocumentWithHash",
          hashAlgorithm: getOperationNameOrHash,
        },
        // ========================
      },
    },
  },
};

/*
 * Generate a hash in the following format: {operationName}_{hash}
 * If the document contains only one operation and that operation has a name, use the operation name along with the first 8 characters of the SHA1 hash of the document.
 * Otherwise, use the full SHA1 hash of the document.
 * Operation names are required to be unique within the repository, and the hash prevents collisions against prior versions.
 */
function getOperationNameOrHash(document: string) {
  // Compute the SHA1 hash of the document
  const hash = createHash("sha1").update(document, "utf8").digest("base64");

  // Parse the document
  const parsedDocument = parse(document);

  // Filter the operations in the document
  const operations = parsedDocument.definitions.filter((def) => def.kind === "OperationDefinition");

  // Check conditions
  if (operations.length === 1) {
    const operation = operations[0];
    if (operation.name) {
      // Return the operation name and the first 8 characters of the base64-encoded hash
      // Note: operation names are only allowed to contain alphanumeric characters and underscores
      return `${operation.name.value}_${hash.slice(0, 8)}`;
    }
  }

  // Return the full hash if no valid single operation is found
  return hash;
}

export default configProduction;

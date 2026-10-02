import js from "@eslint/js";
import eslintReact from "@eslint-react/eslint-plugin";
import { defineConfig, globalIgnores } from "eslint/config";
import reactHooks from "eslint-plugin-react-hooks";
import { reactRefresh } from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["**/node_modules/**", "dist/**", "stats.html", "**/*.g.ts", "**/*.g.tsx", "src/gql/**"]),
  {
    files: ["**/*.{js,cjs,mjs}"],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: "latest",
    },
    rules: {
      "unicode-bom": "off",
      semi: "error",
      "no-tabs": "error",
      indent: "off",
      camelcase: "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    files: ["vite.config.ts", "codegen*.ts"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: [eslintReact.configs["recommended-typescript"], reactHooks.configs.flat.recommended, reactRefresh.configs.vite()],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      "@eslint-react/no-nested-component-definitions": "warn",
      // The official Hooks plugin supplies compiler diagnostics and dependency checks.
      "@eslint-react/error-boundaries": "off",
      "@eslint-react/exhaustive-deps": "off",
      "@eslint-react/globals": "off",
      "@eslint-react/immutability": "off",
      "@eslint-react/purity": "off",
      "@eslint-react/refs": "off",
      "@eslint-react/rules-of-hooks": "off",
      "@eslint-react/set-state-in-effect": "off",
      "@eslint-react/set-state-in-render": "off",
      "@eslint-react/static-components": "off",
      "@eslint-react/unsupported-syntax": "off",
      "@eslint-react/use-memo": "off",
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: ["variable", "parameter"],
          modifiers: ["unused"],
          format: ["camelCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: "default",
          format: ["camelCase"],
        },
        {
          selector: "property",
          modifiers: ["requiresQuotes"],
          format: null,
        },
        {
          selector: "import",
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
        },
        {
          selector: "variable",
          format: ["camelCase"],
        },
        {
          selector: ["variable", "function"],
          modifiers: ["global"],
          format: ["PascalCase", "camelCase"],
        },
        {
          selector: "variable",
          modifiers: ["const"],
          format: ["camelCase", "UPPER_CASE"],
        },
        {
          selector: ["variable", "function"],
          modifiers: ["exported"],
          format: ["PascalCase", "camelCase"],
        },
        {
          selector: "parameter",
          format: ["camelCase"],
        },
        {
          selector: "memberLike",
          modifiers: ["private"],
          format: ["camelCase", "PascalCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: "enumMember",
          format: ["PascalCase"],
        },
        {
          selector: "interface",
          format: ["PascalCase"],
        },
        {
          selector: "typeProperty",
          format: ["camelCase", "PascalCase", "snake_case"],
        },
        {
          selector: ["classProperty", "classMethod"],
          modifiers: ["public"],
          format: ["PascalCase", "camelCase"],
        },
        {
          selector: "typeParameter",
          format: ["PascalCase"],
          prefix: ["T"],
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
      ],
    },
  },
  {
    files: ["src/**/*.queries.ts"],
    rules: {
      // GraphQL Code Generator discovers operations declared as tagged templates.
      "@typescript-eslint/no-unused-expressions": ["error", { allowTaggedTemplates: true }],
    },
  },
]);

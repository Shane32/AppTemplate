module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs", "*.g.ts", "*.g.tsx", "vite.config.ts", "codegen*.ts"],
  parser: "@typescript-eslint/parser",
  plugins: ["react-refresh", "react"],
  rules: {
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    "unicode-bom": "off",
    semi: "error",
    "no-tabs": "error",
    indent: "off",
    camelcase: "off",
    "react/no-unstable-nested-components": ["warn"],
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
};

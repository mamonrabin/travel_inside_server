// @ts-check

import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  js.configs.recommended,
  //   tseslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  {
    rules: {
      // "no-unused-vars": "error",
      // "no-unused-expressions": "error",
      // "prefer-const": "error",
      "no-console": "warn",
      // "no-undef": "error",
    },
  },
);

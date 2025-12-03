import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginSvelte from "eslint-plugin-svelte";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginSvelte.configs["flat/recommended"],
  eslintConfigPrettier,
  {
    rules: {
      // You can override rules here
    },
  },
  {
    ignores: ["build/", ".svelte-kit/", "dist/"],
  },
];
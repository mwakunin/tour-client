import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  prettierConfig, // ✅ Disables ESLint rules that conflict with Prettier
  {
    plugins: {
      prettier, // ✅ Adds Prettier as an ESLint rule
    },
    rules: {
      "prettier/prettier": "warn", // ✅ Show Prettier issues as warnings
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  }, // ✅ FIXED: Added missing closing bracket
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
];

export default eslintConfig;

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeCheckedOnly,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // base rules
    rules: {
      "@typescript-eslint/no-redeclare": "error",
      "@typescript-eslint/prefer-ts-expect-error": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/only-throw-error": "error",
      "no-throw-literal": "off",
    },
  },
  {
    // ignore specific files
    ignores: ["dist/", "*.config.js", "*.config.ts"],
  },
  {
    // warning for refactoring
    rules: {
      "@typescript-eslint/no-empty-interface": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-deprecated": "warn",
      "@typescript-eslint/await-thenable": "warn",
      "@typescript-eslint/require-await": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports",
          disallowTypeAnnotations: false,
          fixStyle: "inline-type-imports",
        },
      ],
      "@typescript-eslint/ban-ts-comment": [
        "warn",
        {
          "ts-ignore": true,
          "ts-expect-error": "allow-with-description",
        },
      ],
      "prefer-const": "warn",
      complexity: ["warn", { max: 7 }],
      "no-console": "warn",
    },
  },
  {
    // allow console in examples
    files: ["examples/*.ts"],
    rules: {
      "no-console": "off",
    },
  }
);
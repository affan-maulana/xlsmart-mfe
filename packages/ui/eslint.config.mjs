import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // This package is a component library, not an application: the Next.js
      // rule that looks for a pages/app directory does not apply here.
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  globalIgnores(["node_modules/**", "coverage/**", ".turbo/**", "dist/**"]),
]);

export default eslintConfig;

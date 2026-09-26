import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Installed agent skills — third-party example code, not ours to fix.
    ".agents/**",
    // Deno edge functions: different runtime, different tsconfig, and they
    // already carry their own `deno-lint-ignore` directives. Lint them with
    // `deno lint`, not with the Next.js config.
    "supabase/functions/**",
  ]),
]);

export default eslintConfig;

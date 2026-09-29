import "@testing-library/jest-dom/vitest";

/**
 * Configuration is read lazily at request time, so tests provide the same
 * contract that CI and production inject through environment variables.
 */
process.env.AUTH_API_URL ??= "https://auth.example.test";
process.env.DEFAULT_RETURN_URL ??= "https://app.example.test/";
process.env.ALLOWED_RETURN_ORIGINS ??=
  "http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:3004";

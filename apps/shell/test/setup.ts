import "@testing-library/jest-dom/vitest";

/**
 * Configuration is read lazily at request time, so tests provide the same
 * contract that CI and production inject through environment variables.
 *
 * The shell has no AUTH_API_URL on purpose: it never reaches the auth service,
 * only the auth application's session contract.
 */
process.env.AUTH_APP_URL ??= "https://app.example.test/auth";
process.env.AUTH_SESSION_URL ??= "http://auth-app:3004/auth/api/session";
process.env.PUBLIC_APP_URL ??= "https://app.example.test";
process.env.QUEUE_SUMMARY_URL ??= "http://queue:3002/queue/api/summary";
process.env.CUSTOMER360_URL ??= "https://app.example.test/customer360";
process.env.QUEUE_URL ??= "https://app.example.test/queue";
process.env.PRETOPOST_URL ??= "https://app.example.test/pretopost";

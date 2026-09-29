import "@testing-library/jest-dom/vitest";

/**
 * Configuration is read lazily at request time, so tests provide the same
 * contract CI and production inject through environment variables.
 *
 * PUBLIC_APP_URL is an ORIGIN only - the application appends its own basePath.
 * Putting the path in here produces a doubled return target (/queue/queue).
 */
process.env.QUEUE_API_URL ??= "https://queue.example.test";
process.env.AUTH_APP_URL ??= "http://localhost:3004/auth";
process.env.PUBLIC_APP_URL ??= "http://localhost:3002";
process.env.SHELL_URL ??= "http://localhost:3000";

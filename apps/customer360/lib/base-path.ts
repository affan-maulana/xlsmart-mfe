/**
 * Single source of truth for where this application is mounted.
 *
 * next.config.ts uses it for `basePath`, and client code uses it because
 * fetch() - unlike <Link> and router.push() - is not prefixed automatically.
 */
export const basePath = "/customer360";

export function withBasePath(path: string): string {
  return `${basePath}${path}`;
}

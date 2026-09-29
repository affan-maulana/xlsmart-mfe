/**
 * Single source of truth for where this application is mounted.
 *
 * next.config.ts uses it for `basePath`, and client code uses it because
 * fetch() - unlike <Link> and router.push() - is not prefixed automatically.
 *
 * Auth needs its own basePath: two applications served from one origin would
 * otherwise both claim /_next/* for their static assets.
 */
export const basePath = "/auth";

export function withBasePath(path: string): string {
  return `${basePath}${path}`;
}

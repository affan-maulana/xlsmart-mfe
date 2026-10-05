/**
 * @repo/auth - shared session contract and navigation metadata.
 *
 * Types, contracts, data mappers, session helpers and navigation metadata
 * only. UI components stay in @repo/auth's sibling @repo/ui; domain data
 * stays in each application. Every application fetches its own session
 * through these helpers - no global state, no cross-MFE context.
 */

export type {
  NavChildItem,
  NavIconName,
  NavItem,
  SessionResult,
  SessionUser,
  User,
} from "./types";
export { STAFF_METADATA, mapSessionUser } from "./metadata";
export {
  DEV_BYPASS_TOKEN,
  DEV_USER,
  devBypassEnabled,
  type DevUser,
} from "./dev-bypass";
export {
  SESSION_COOKIE,
  getSession,
  getSessionToken,
  requireSession,
} from "./session";
export { getNavigation } from "./navigation";

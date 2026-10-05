/**
 * Design tokens — public entry point.
 *
 * Dependency direction: this layer depends on NOTHING (no components, no
 * routes, no business logic). Everything above it depends on it, never the
 * reverse. Designed to be extracted verbatim into `packages/design-tokens`
 * for shared use across XLSMART MFEs.
 */
export * from './colors';
export * from './typography';
export * from './spacing';
export * from './radius';
export * from './shadows';
export * from './breakpoints';

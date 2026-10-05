/**
 * Breakpoint tokens.
 *
 * Tailwind `theme.screens` in `tailwind.config.ts` MUST stay in sync with these
 * values (Tailwind requires static numbers at build time). JS consumers use
 * these for matchMedia queries and imperative layout math.
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type BreakpointName = keyof typeof BREAKPOINTS;

/** Standard icon sizing (Tailwind utilities `icon-sm` … `icon-xl`). */
export const ICON_SIZES = {
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
} as const;

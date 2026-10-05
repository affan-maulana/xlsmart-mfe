/**
 * Border-radius tokens. The CSS variables in `globals.css` are the runtime
 * source of truth; Tailwind utilities (`rounded-sm` … `rounded-pill`) map to
 * them. Use these constants only for JS-side geometry.
 */
export const RADIUS = {
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
  card: 'var(--radius-card)',
  pill: 'var(--radius-pill)',
} as const;

export type RadiusToken = keyof typeof RADIUS;

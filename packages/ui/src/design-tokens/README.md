# Design Tokens

Single source of truth for the XLSMART visual language, built for later
extraction into a workspace package (`packages/design-tokens`) shared across MFEs.

## Sources of truth

| Concern            | Source of truth                                           | Consumed via                                                                                   |
| ------------------ | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Color (runtime)    | `:root` CSS variables in `app/globals.css`                | Tailwind semantic utilities (`bg-primary`, `text-muted-foreground`, …)                         |
| Color (raw values) | `colors.ts` (`BRAND_COLORS`)                              | JS-only needs (gradients, canvas); `BRAND_COLORS_HSL` mirrors globals.css and is drift-checked |
| Typography         | Tailwind `fontSize` theme                                 | `typography.ts` documents roles + JS scale                                                     |
| Spacing            | Tailwind 4px scale                                        | `spacing.ts` documents layout roles                                                            |
| Radius / shadows   | CSS variables (`--radius-*`, `--shadow-*`) in globals.css | Tailwind `rounded-*` / `shadow-*`, `radius.ts` / `shadows.ts` for JS                           |
| Breakpoints        | `tailwind.config.ts` `screens` (static)                   | `breakpoints.ts` (kept in sync)                                                                |

## Rules

- Components must never hardcode hex values — use semantic Tailwind utilities.
- No parallel legacy token names (`brand-indigo`, `ink-900`, `status-*`) — they
  were removed during the migration.
- `components/design-tokens/**` imports nothing from `components/ui|atoms|…`,
  `app/`, or route code.
- State tokens are part of the system: hover/active/focus-visible/disabled are
  expressed via Tailwind state variants on the primitives (`ui/`), never by
  ad-hoc overrides in features.

## Drift check

The brand HSL triplets in `colors.ts` must match `globals.css`:

```
node components/design-tokens/scripts/verify-tokens.mjs
```

## Token contract (for the future `packages/design-tokens`)

- Entry point: `index.ts` re-exports everything.
- `package.json` to be created at extraction time with `"exports": { ".": "./index.ts" }`
  (or built `dist/`), peer-dep on `tailwindcss@^3`.
- globals.css `:root` block is intended to ship as `tokens.css` alongside.

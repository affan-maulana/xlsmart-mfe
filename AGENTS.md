# Project instructions for coding agents

This repository implements the architecture contract in
[`docs/mfe-prompt/prompt-0.md`](./docs/mfe-prompt/prompt-0.md). Read it before
writing code here. The rules below are the ones that are easy to break by
accident; `pnpm check:architecture` enforces them in CI.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript strict · pnpm workspaces ·
Turborepo · Tailwind CSS v4 · shadcn/ui-style primitives on Radix · React Hook
Form + Zod · Vitest + Testing Library · Docker + NGINX.

Backend services are Go + Echo and live in a **separate repository**. Never move
backend code, mocks or schema definitions into this monorepo.

## Hard rules

1. **No Module Federation.** No `@module-federation/*`, no `remoteEntry`, no
   runtime composition. Design for it (own `basePath`, own BFF, own deployable),
   do not implement it.
2. **No cross-application imports.** `apps/*` may import only its own files and
   `@repo/ui`. Applications are `private` and expose no package entry points.
3. **No JWT in the browser.** HttpOnly cookie only. Never place a token in
   `localStorage`, `sessionStorage`, `window`, a store, or a Client Component.
   Convert it to `Authorization: Bearer <jwt>` on the server.
4. **No global state.** No Redux, Zustand, Jotai, event bus, or `window.__`
   shared objects. Use local component state and server data.
5. **No centralized BFF.** Each domain owns its BFF (its own Next server:
   Server Component data access + `app/api/*` route handlers) and calls only its
   own backend.
6. **No premature shared packages.** `packages/ui` is the only shared package.
   Do not create `packages/shared`, `network`, `api`, `utils`, `config`, or
   `core` without a proven requirement. Build first, extract later — duplicated
   domain code is cheaper than a wrong boundary.
7. **Shared UI stays presentational.** Button, PageHeader, Modal, DataTable,
   StatusBadge are fine. `CustomerTable`, `QueueCard`, `PrepaidForm` are not:
   business components stay in their domain. Domain status → tone mapping lives
   in the domain, not in `packages/ui`.
8. **Independent deployment.** Every app keeps its own `Dockerfile`,
   `/api/health` probe, and `basePath`. Runtime configuration resolves lazily at
   request time so one artifact promotes across environments — do not read
   `process.env` at module scope.
9. **Authentication lives in `apps/auth` only.** It is the sole application that
   references `AUTH_API_URL`, issues or clears the session cookie, or renders the
   sign-in form. Other apps read identity through `GET /auth/api/session` (relaying
   the incoming `Cookie` header, never interpreting its value) and link to
   `/auth/login` and `/auth/logout`. Do not add login UI or cookie writes
   anywhere else. Post-login return targets must be absolute origins on
   `ALLOWED_RETURN_ORIGINS` — a relative target would resolve against the auth
   app's own `basePath`.

## Domain ownership

| App          | Owns                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| auth         | sign-in, sign-out, the session cookie, `GET /auth/api/session`           |
| shell        | global layout, nav, sidebar, header, user info, queue info widget        |
| customer360  | customer search, profile, interactions, customer data                    |
| queue        | queue lifecycle, status, rules, tickets, `GET /queue/api/summary`        |
| pretopost    | prepaid/postpaid migration and conversion workflows                      |

The shell may read the Queue **summary contract** over HTTP
(`QUEUE_SUMMARY_URL`) and the auth **session contract** (`AUTH_SESSION_URL`). It
may never own queue workflow, rules, or actions, and may not hold credentials.

Ports: auth 3004 · shell 3000 · customer360 3001 · queue 3002 · pretopost 3003.
Sub-path basePaths: `/auth`, `/customer360`, `/queue`, `/pretopost`; the shell is
mounted at `/`.

## Working here

```bash
pnpm dev              # all apps;  pnpm dev:queue  # one app
pnpm check            # architecture + lint + typecheck + test + build
pnpm check:architecture
```

Forms are schema-driven: define the Zod schema in `lib/schemas.ts` and import
the same schema into both the React Hook Form resolver and the BFF route handler
so client and server cannot disagree.

Prefer Server Components; use Client Components only where interactivity
requires it (client files receive plain serializable props, never functions).

If a requested change conflicts with a rule above, stop, name the rule, and
propose the compliant alternative instead of implementing it.

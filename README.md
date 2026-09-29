# Meteor Microfrontend Platform

Domain-oriented microfrontend platform: **5 independently developed, independently
deployable Next.js 16 applications** that share one design system and one login,
but share no runtime, no state, and no code between domains.

Built from [`docs/mfe-prompt/prompt-0.md`](./docs/mfe-prompt/prompt-0.md), which is
the authoritative architecture contract for this repository.

```text
https://app.company.com            -> shell          (platform: layout, nav, user info)
https://app.company.com/auth       -> auth           (identity: sign-in, session contract)
https://app.company.com/customer360 -> customer360   (customer domain)
https://app.company.com/queue       -> queue         (queue domain)
https://app.company.com/pretopost   -> pretopost     (prepaid/postpaid domain)
```

## Quick start

```bash
pnpm install

# Each application reads its own .env; examples are committed.
for app in auth shell customer360 queue pretopost; do
  cp "apps/$app/.env.example" "apps/$app/.env.local"
done

pnpm dev            # all five: auth :3004, shell :3000, customer360 :3001, queue :3002, pretopost :3003
pnpm dev:queue      # one application at a time (Turborepo filter, no custom orchestration)
```

Then open <http://localhost:3000>.

Without the Go services running the platform still boots: every screen renders an
explicit "service unavailable" state instead of a stack trace. Sign-in needs the
auth service, so point `AUTH_API_URL` (in `apps/auth/.env.local`) at a running
instance to go further.

## Layout

```text
apps/
  auth/           identity - the only place that issues or clears the cookie
  shell/          platform application: layout, nav, user info, queue widget
  customer360/    search, profile, interactions
  queue/          lifecycle, status, tickets, published summary API
  pretopost/      migration and conversion workflows
packages/
  ui/             presentational primitives only (the one permitted shared package)
infra/
  nginx/          sub-path routing for the five upstreams
  docker-compose.yml
scripts/
  check-architecture.mjs
```

### Who owns what

| Application  | Owns                                                              | Must never contain                     |
| ------------ | ----------------------------------------------------------------- | -------------------------------------- |
| auth         | sign-in, sign-out, the session cookie, `GET /auth/api/session`     | any domain data or workflow           |
| shell        | layout, sidebar, header, user info, queue info **widget**           | any domain workflow, any credential    |
| customer360  | customer search, profile, interactions, its own BFF                 | queue or billing workflow             |
| queue        | queue lifecycle, rules, tickets, `GET /queue/api/summary`           | customer master data                  |
| pretopost    | prepaid/postpaid migration + conversion workflows                   | queue operations                      |

Two contracts carry data across application boundaries, both over HTTP: the shell
renders the queue information widget from Queue's published summary
(`QUEUE_SUMMARY_URL`), and reads who is signed in from auth's session contract
(`AUTH_SESSION_URL`). Neither is an import, and no other cross-application path
exists.

## Rules, enforced by CI

`pnpm check:architecture` encodes the contract as executable checks, so a violation
fails a build instead of a code review:

- **No Module Federation** — no `@module-federation/*`, no `remoteEntry`, no runtime composition.
- **No cross-MFE imports** — a relative import may not leave its own `apps/<app>` directory; `@app/*` packages are private and expose nothing.
- **No JWT exposure** — client components may not touch `localStorage`, `sessionStorage`, `document.cookie`, or decode a token.
- **No global state** — no Redux/Zustand/event bus/`window.__` shared state. Local component state and server data only.
- **No premature shared packages** — `packages/` may contain `ui` and nothing else until a real requirement exists.
- **No centralized BFF** — a domain application may not address another domain's API.
- **Single auth service** — only `apps/auth` may reference `AUTH_API_URL` or write the session cookie; `apps/auth` may not touch any domain API.
- **Independent deployment** — every application has its own `Dockerfile` and `/api/health` probe.

## Authentication

One HttpOnly cookie, issued by exactly one application and shared by all five.

```text
Browser -> auth /auth/api/auth/login -> Go auth service
                                          |
            HttpOnly JWT cookie <---------+   (never in a response body)
                    |
     +--------------+----------------+
     |                               |
 shell relays the Cookie header   domain BFF converts the cookie
 to /auth/api/session             to  Authorization: Bearer <jwt>
 -> gets profile fields only      -> its own Go service verifies it
```

`apps/auth` is the only application that reaches the auth service or writes the
cookie - `pnpm check:architecture` fails the build if anything else does. Nothing
in any other application reads the cookie's value: the shell relays the incoming
`Cookie` header to the identity contract, and domain BFFs pass the token to their
own backend, which is the party that verifies it.

Cookie attributes (`apps/auth/lib/config.ts`): `HttpOnly`, `SameSite=Lax`, `Path=/`,
`Secure` in production, 8-hour expiry. `Path=/` on the shared parent domain is what
lets `/customer360`, `/queue` and `/pretopost` reuse a single sign-in, and works
across ports in development because cookies ignore ports.

Sign-in and sign-out are **navigations, not fetches**: `/auth/login` and
`/auth/logout?next=…`. That keeps the shell's sign-out from needing a credentialed
cross-origin request, which development's separate ports would otherwise require.

**Return targets are absolute and allowlisted.** Two reasons, both learned the hard
way: `redirect()` applies the auth app's own `basePath` to a relative target, so
`next=/queue` would have become `/auth/queue`; and `?next=` is the classic
open-redirect vector. So a target is honoured only if it parses to an http(s) origin
present in `ALLOWED_RETURN_ORIGINS` - the platform's own origins, never a wildcard.
Anything else (relative path, `//host`, unlisted origin, `javascript:`) falls back to
`DEFAULT_RETURN_URL`. Consequence: every application must set `PUBLIC_APP_URL` to its
absolute origin **in production too**, and production must list its public origin in
`ALLOWED_RETURN_ORIGINS`.

**Trust dependency.** The frontend deliberately holds no signing secret, so the token
is forwarded without being verified. Every domain Go endpoint must authenticate the
Bearer token itself, and each domain must expose `GET /v1/session` returning the
caller's profile - that is what page-level guards call. Domain BFFs also refuse to
proxy a request that carries no session cookie at all, so an anonymous browser never
reaches a domain service regardless of how that service is configured.

## Backend contract

Backends live in a separate repository (Go + Echo) and are never vendored here.

| Service      | Env var              | Called by       | Endpoints                                                                       |
| ------------ | -------------------- | --------------- | ------------------------------------------------------------------------------- |
| auth         | `AUTH_API_URL`       | **apps/auth only** | `POST /v1/auth/login`, `POST /v1/auth/logout`, `GET /v1/me`                  |
| customer360  | `CUSTOMER360_API_URL`| apps/customer360 | `GET /v1/session`, `GET /v1/customers`, `GET /v1/customers/:id`, `…/interactions` |
| queue        | `QUEUE_API_URL`      | apps/queue      | `GET /v1/session`, `GET /v1/queues`, `GET /v1/queues/:id`, `PATCH …/status`, `POST …/tickets/actions` |
| pretopost    | `PRETOPOST_API_URL`  | apps/pretopost  | `GET /v1/session`, `GET/POST /v1/migrations`, `GET /v1/migrations/:id`, `POST …/decision` |

Applications publish contracts to each other too, which is the only permitted
cross-application traffic:

| Contract                   | Published by | Consumed by | Returns                                              |
| -------------------------- | ------------ | ----------- | ---------------------------------------------------- |
| `GET /auth/api/session`    | apps/auth    | apps/shell  | `{ authenticated, user: { id, name, email, role } }` |
| `GET /queue/api/summary`   | apps/queue   | apps/shell  | aggregate counts for the queue information widget     |

Form validation is schema-driven with Zod, and the same schema file is imported by
both the React Hook Form resolver and the BFF route handler, so the browser and the
server can never disagree about what is valid.

## Independent deployment

Each application builds its own image from the repository root:

```bash
docker build -f apps/queue/Dockerfile -t meteor/queue:1.0.0 .
```

`output: "standalone"` plus `outputFileTracingRoot` produces a self-contained server;
the runner is `node:24-alpine` as a non-root user with a healthcheck. Because runtime
configuration resolves lazily at request time, **one artifact can be promoted across
environments** — CI builds need no secrets.

Run the whole production-shaped stack locally:

```bash
docker compose -f infra/docker-compose.yml up --build   # edge on http://localhost:8080
```

NGINX forwards each path unchanged (`infra/nginx/conf.d/mfe.conf`); because each app
declares its own `basePath`, the same URL shape works in `pnpm dev` and behind the edge.

## CI/CD

`.github/workflows/ci.yml` uses the Turborepo dependency graph rather than rebuilding
the monorepo on every push:

```bash
pnpm turbo run lint typecheck test build --filter="...[origin/main]"
```

Change `apps/queue` and only queue is verified and imaged. Change `packages/ui` and all
five applications are, because they all depend on it. The images job builds a matrix of
only the affected applications and fails if an image cannot answer its health probe.

## Testing

Vitest + Testing Library per workspace (`pnpm test`), 49 tests today:

- `apps/auth` — login sets an HttpOnly cookie **and keeps the token out of the response body**; a token the auth service will not honour never becomes a cookie; the session contract whitelists profile fields and distinguishes "signed out" (401) from "identity service down" (503); `?next=` refuses relative, `//host`, `javascript:` and unlisted origins.
- `packages/ui` — Modal focus/escape behaviour, DataTable loading/empty/selection, Button `asChild`, token merging.
- `apps/shell` — sign-in and sign-out links carry an absolute, platform-owned return target.
- `apps/queue` — the aggregate maths behind the shell widget (closed queues excluded), and that `loginUrl()` composes origin + basePath exactly once.
- other domains — Zod schema boundaries and status-to-tone mapping.

Playwright is the intended E2E layer; each app exposes a stable `data-slot` attribute per
component and a `/api/health` probe to make that cheap to add later.

## Deliberate non-goals

| Temptation                       | Why it is absent                                                            |
| -------------------------------- | --------------------------------------------------------------------------- |
| Module Federation                | Not needed for independent deployment; adds a shared runtime nobody asked for. |
| A `packages/shared` grab bag     | Duplication in three domain apps is cheaper than a wrongly-abstracted boundary. |
| Global store / event bus         | Server data plus local state covers these workflows.                        |
| Centralised gateway BFF          | Ownership would drift away from the domains.                                |
| Login code in more than one app  | `apps/auth` alone holds it; the architecture gate rejects a second issuer.  |
| Client-side token storage        | `localStorage` is readable by any XSS payload.                              |

**Auth is a platform service, not a centralized BFF.** The "no centralized BFF" rule
exists to stop domain data and workflow from leaking upward into a shared layer.
Identity is genuinely cross-cutting - one browser session cannot be owned by three
domains - so it is its own application with its own deployable, and the gate keeps it
narrow: it may not touch any domain API.

**Migration path when federation is genuinely required:** applications already have
their own `basePath`, own BFF, and own deployable. Replace the shell's link list
(`apps/shell/lib/config.ts` → `getNavigation()`) with mounted remotes, keep
`@repo/ui` as the shared singleton, and move cross-app data behind contracts like the
existing queue summary and session contract. No domain code moves.

## Commands

| Command                        | Purpose                                             |
| ------------------------------ | --------------------------------------------------- |
| `pnpm dev`                     | run all five applications                           |
| `pnpm dev:auth`                | run one application (also `:shell`, `:customer360`, `:queue`, `:pretopost`) |
| `pnpm build`                   | build everything through Turborepo                  |
| `pnpm lint` / `typecheck` / `test` | per-workspace quality tasks                      |
| `pnpm check:architecture`      | verify the rules in `docs/mfe-prompt/prompt-0.md`   |
| `pnpm check`                   | architecture + lint + typecheck + test + build      |

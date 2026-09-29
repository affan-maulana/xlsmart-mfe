# syntax=docker/dockerfile:1

# customer360 — one of four independently deployable applications.
# Build from the repository root so pnpm can resolve the workspace:
#   docker build -f apps/customer360/Dockerfile -t meteor/customer360 .

FROM node:24-alpine AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /repo

# ---- dependencies ---------------------------------------------------------
# Only manifests are copied here, so this layer stays cached until a
# dependency actually changes.
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json tsconfig.base.json .npmrc ./
COPY packages/ui/package.json ./packages/ui/
COPY apps/auth/package.json ./apps/auth/
COPY apps/shell/package.json ./apps/shell/
COPY apps/customer360/package.json ./apps/customer360/
COPY apps/queue/package.json ./apps/queue/
COPY apps/pretopost/package.json ./apps/pretopost/
RUN pnpm install --frozen-lockfile

# ---- build ----------------------------------------------------------------
FROM deps AS build
COPY . .
ARG APP_VERSION=dev
ENV APP_VERSION=${APP_VERSION} NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @app/customer360 build

# ---- run ------------------------------------------------------------------
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3001
ENV NEXT_TELEMETRY_DISABLED=1

# Unprivileged runtime user.
RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs

# output: "standalone" emits a self-contained server; static assets and public
# files are copied alongside it because they are not traced into the bundle.
COPY --from=build --chown=nextjs:nodejs /repo/apps/customer360/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /repo/apps/customer360/.next/static ./apps/customer360/.next/static
COPY --from=build --chown=nextjs:nodejs /repo/apps/customer360/public ./apps/customer360/public

USER nextjs
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null "http://127.0.0.1:$PORT/customer360/api/health" || exit 1

CMD ["node", "apps/customer360/server.js"]

#!/usr/bin/env node
/**
 * Architecture compliance gate for the microfrontend platform.
 *
 * Every rule encoded here comes straight from docs/mfe-prompt/prompt-0.md.
 * These are the rules a reviewer reliably forgets under deadline pressure, so
 * they are enforced by CI instead: run with `pnpm check:architecture`.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { posix } from "node:path";

const ROOT = process.cwd();
const APPS = ["shell", "auth", "customer360", "queue", "pretopost"];
/** Platform applications (no domain business data) versus domain applications. */
const PLATFORM_APPS = new Set(["shell", "auth"]);
const DOMAIN_APPS = APPS.filter((name) => !PLATFORM_APPS.has(name));
const SOURCE_EXTENSIONS = [".ts", ".tsx", ".mjs", ".js"];
const IGNORED_DIRECTORIES = new Set(["node_modules", ".next", ".turbo", "coverage", "dist", ".git"]);

const toPosixPath = (value) => value.split(sep).join(posix.sep);

const violations = [];

function report(rule, file, line, detail) {
  violations.push({ rule, file, line, detail });
}

function* walk(directory) {
  for (const entry of readdirSync(directory)) {
    if (IGNORED_DIRECTORIES.has(entry) || entry.startsWith(".env")) continue;
    const path = join(directory, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) yield* walk(path);
    else yield path;
  }
}

function readSources(directory) {
  const files = [];
  try {
    for (const path of walk(directory)) {
      const extension = path.slice(path.lastIndexOf("."));
      if (SOURCE_EXTENSIONS.includes(extension) || path.endsWith("package.json")) {
        files.push(path);
      }
    }
  } catch {
    /* directory absent - nothing to check */
  }
  return files;
}

/**
 * Prose is not a violation. Docs explaining why `AUTH_API_URL` is absent from an
 * application must not fail a rule about `AUTH_API_URL` being absent from it, so
 * comment lines are skipped. Leading-comment detection is deliberately simple:
 * stripping `//` anywhere would truncate the URLs these files legitimately
 * contain, so only lines that *start* as comments are excluded.
 */
function isCommentLine(text) {
  const trimmed = text.trim();
  return trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*");
}

function scanFile(path, patterns, rule) {
  const content = readFileSync(path, "utf8");
  const lines = content.split("\n");

  lines.forEach((text, index) => {
    if (isCommentLine(text)) return;
    for (const { test, detail } of patterns) {
      if (test(text, path)) report(rule, relative(ROOT, path), index + 1, `${detail}\n      ${text.trim()}`);
    }
  });
}

const isClientFile = (path) => {
  const content = readFileSync(path, "utf8");
  return /^\s*"use client";/m.test(content) || /^\s*'use client';/m.test(content);
};

// ---------------------------------------------------------------------------
// Rule 1 - no cross-application imports
// ---------------------------------------------------------------------------
for (const app of APPS) {
  for (const file of readSources(join(ROOT, "apps", app))) {
    scanFile(
      file,
      [
        {
          test: (text) => /from\s+["']@app\/(?!shell\/)/.test(text) && !text.includes(`@app/${app}`),
          detail: `@app/* is an application package and must never be imported${
            app === "shell" ? " (applications are private and expose no exports)" : " from another application"
          }`,
        },
        {
          test: (text) => /from\s+["'](?:\.\.\/)+\.\.\/(?:\.\.\/)?apps\//.test(text),
          detail: "relative import reaches into another application",
        },
        {
          // A relative import must stay inside apps/<app>. Resolve it against
          // the importing file's directory, the same way a bundler would.
          test: (text, filePath) => {
            const match = text.match(/from\s+["'](\.\.?\/[^"']+)["']/);
            if (!match) return false;
            const fileDirectory = toPosixPath(relative(ROOT, dirname(filePath)));
            const resolved = posix.normalize(posix.join(fileDirectory, match[1]));

            return (
              (resolved.startsWith("apps/") && !resolved.startsWith(`apps/${app}/`)) ||
              resolved.startsWith("packages/") ||
              resolved.startsWith("..")
            );
          },
          detail: "relative import escapes this application's directory",
        },
      ],
      "No Cross-MFE Imports",
    );
  }
}

// ---------------------------------------------------------------------------
// Rule 2 - module federation stays unimplemented (design for it, do not use it)
// ---------------------------------------------------------------------------
const federationPatterns = [
  { test: (t) => /@module-federation|\bwebpack\b|next-federation|rsbuild|\rimf\b/i.test(t), detail: "module federation dependency" },
  { test: (t) => /remoteEntry|remotes\s*:|federation/.test(t), detail: "module federation construct" },
];

for (const path of [
  ...readSources(join(ROOT, "apps")),
  ...readSources(join(ROOT, "packages")),
  ...readdirSync(ROOT)
    .filter((name) => name.endsWith("package.json") || name === "pnpm-workspace.yaml")
    .map((name) => join(ROOT, name)),
]) {
  if (path.endsWith("package.json") || path.endsWith(".yaml")) {
    const content = readFileSync(path, "utf8");
    for (const { test, detail } of federationPatterns) {
      if (test(content) && /module-federation|remoteEntry/i.test(content)) {
        report("No Module Federation", relative(ROOT, path), 0, `${detail} referenced in this manifest`);
      }
    }
  } else {
    scanFile(path, federationPatterns, "No Module Federation");
  }
}

// ---------------------------------------------------------------------------
// Rule 3 - the JWT never reaches the browser
// ---------------------------------------------------------------------------
for (const app of APPS) {
  for (const file of readSources(join(ROOT, "apps", app))) {
    if (!isClientFile(file)) continue;

    scanFile(
      file,
      [
        { test: (t) => /\blocalStorage\b/.test(t), detail: "browser storage is forbidden for tokens" },
        { test: (t) => /\bsessionStorage\b/.test(t), detail: "browser storage is forbidden for tokens" },
        { test: (t) => /document\.cookie|js-cookie/.test(t), detail: "client code must not touch cookies" },
        { test: (t) => /jwt-decode|jwtDecode|\batob\s*\(/.test(t), detail: "client code must not decode a JWT" },
      ],
      "No JWT Exposure",
    );
  }
}

// ---------------------------------------------------------------------------
// Rule 4 - no global or cross-application state
// ---------------------------------------------------------------------------
for (const path of [...readSources(join(ROOT, "apps")), ...readSources(join(ROOT, "packages"))]) {
  scanFile(
    path,
    [
      { test: (t) => /\bzustand\b|\bredux\b|@reduxjs|\bjotai\b|\brecoil\b/.test(t), detail: "global store library" },
      { test: (t) => /new EventTarget\(|window\.__|globalThis\.__|CustomEvent\(/.test(t), detail: "shared window state or event bus" },
    ],
    "No Global State",
  );
}

// ---------------------------------------------------------------------------
// Rule 5 - shared packages stay minimal (Build First, Extract Later)
// ---------------------------------------------------------------------------
const sharedPackages = readdirSync(join(ROOT, "packages")).filter((name) => {
  try {
    return statSync(join(ROOT, "packages", name)).isDirectory();
  } catch {
    return false;
  }
});

for (const name of sharedPackages) {
  if (name !== "ui") {
    report(
      "No Premature Shared Packages",
      `packages/${name}`,
      0,
      "only packages/ui is authorised; create another shared package only when a real requirement exists",
    );
  }
}

// ---------------------------------------------------------------------------
// Rule 6 - no centralized BFF: a domain app must not call another domain
// ---------------------------------------------------------------------------
for (const app of APPS.filter((name) => name !== "shell")) {
  for (const file of readSources(join(ROOT, "apps", app))) {
    scanFile(
      file,
      APPS.filter((other) => other !== app).map((other) => ({
        test: (t) => new RegExp(`/(?:api|v1)/.*${other}|${other}(?:-api|_api)|/\\b${other}\\b/api`).test(t),
        detail: `reaching the ${other} domain from the ${app} application creates a centralized BFF`,
      })),
      "No Centralized BFF",
    );
  }
}

// ---------------------------------------------------------------------------
// Rule 8 - authentication lives in exactly one application
//
// apps/auth is the only place that talks to the auth service, the only place
// that writes the session cookie, and the only place that must not touch domain
// data. Without this, "single auth service" decays back into duplicated login
// code the moment someone needs a small tweak in another app.
// ---------------------------------------------------------------------------
for (const app of APPS.filter((name) => name !== "auth")) {
  for (const file of readSources(join(ROOT, "apps", app))) {
    scanFile(
      file,
      [
        {
          test: (t) => /AUTH_API_URL/.test(t),
          detail:
            "only apps/auth may reach the auth service; read identity through GET /auth/api/session instead",
        },
        {
          test: (t) =>
            /\b(?:cookies|cookieStore|store|response\.cookies)\.set\(/.test(t) ||
            /["']set-cookie["']/i.test(t),
          detail: "only apps/auth may issue or clear the session cookie",
        },
      ],
      "Single Auth Service",
    );
  }
}

for (const file of readSources(join(ROOT, "apps", "auth"))) {
  scanFile(
    file,
    DOMAIN_APPS.map((domain) => ({
      test: (t) => new RegExp(`${domain.toUpperCase()}_API_URL|/${domain}/api\\b`).test(t),
      detail: `the auth application must not read the ${domain} domain - it owns identity only`,
    })),
    "Single Auth Service",
  );
}

// ---------------------------------------------------------------------------
// Rule 8b - AUTH_DEV_BYPASS must co-locate with a production refusal
//
// The dev bypass is an env-controlled escape hatch (NODE_ENV=development only)
// that lets the platform be browsed without Go services. If someone copies the
// bypass check without the production guard, a misconfigured deploy could
// silently accept unsigned traffic. Every file that checks AUTH_DEV_BYPASS
// must also throw when NODE_ENV=production.
// ---------------------------------------------------------------------------
for (const app of APPS) {
  for (const file of readSources(join(ROOT, "apps", app))) {
    const content = readFileSync(file, "utf8");
    if (/AUTH_DEV_BYPASS/.test(content) && !/NODE_ENV/.test(content)) {
      report(
        "Dev Bypass Guard",
        relative(ROOT, file),
        0,
        "this file references AUTH_DEV_BYPASS but does not check NODE_ENV=production; a dev escape hatch must refuse to run under production",
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Rule 9 - independent deployment: every app owns a Dockerfile and a health probe
// ---------------------------------------------------------------------------
for (const app of APPS) {
  const directory = join(ROOT, "apps", app);
  if (!readdirSync(directory).includes("Dockerfile")) {
    report("Independent Deployment", `apps/${app}/Dockerfile`, 0, "each application must build its own image");
  }
  if (!readdirSync(join(directory, "app", "api")).includes("health")) {
    report("Independent Deployment", `apps/${app}/app/api/health`, 0, "each application must expose a liveness probe");
  }
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------
if (violations.length === 0) {
  console.log(
    `✓ Architecture rules passed\n  ${APPS.length} applications + packages/ui checked against docs/mfe-prompt/prompt-0.md`,
  );
  process.exit(0);
}

const byRule = new Map();
for (const violation of violations) {
  byRule.set(violation.rule, [...(byRule.get(violation.rule) ?? []), violation]);
}

console.error(`✗ Architecture violations found: ${violations.length}\n`);
for (const [rule, items] of byRule) {
  console.error(`  ${rule}`);
  for (const item of items) {
    console.error(`    ${item.file}${item.line ? `:${item.line}` : ""}`);
    console.error(`      ${item.detail}`);
  }
  console.error("");
}
console.error("Stop. Fix the violation or document why the rule should change.");
process.exit(1);

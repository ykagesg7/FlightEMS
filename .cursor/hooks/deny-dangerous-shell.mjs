#!/usr/bin/env node
/**
 * Cursor beforeShellExecution hook: deny a small set of high-risk shell patterns.
 * stdin: JSON payload from Cursor (expects `command` string field).
 * stdout: JSON { permission: "allow" | "deny", userMessage?: string }
 * @see https://cursor.com/docs/hooks
 */

import { readFileSync } from "node:fs";

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function allow() {
  process.stdout.write(JSON.stringify({ permission: "allow" }));
  process.exit(0);
}

/**
 * @param {string} message
 */
function deny(message) {
  process.stdout.write(
    JSON.stringify({
      permission: "deny",
      userMessage: message,
    }),
  );
  process.exit(0);
}

const raw = readStdin().trim();
if (!raw) {
  allow();
}

/** @type {{ command?: string }} */
let payload;
try {
  payload = JSON.parse(raw);
} catch {
  // Fail open on unparseable payload when failClosed is set on the hook entry
  // Cursor still treats script crash as fail-closed; parsing errors should allow
  // only if we exit cleanly with allow to avoid blocking all shells on schema drift.
  allow();
}

const command = typeof payload.command === "string" ? payload.command : "";
const normalized = command.replace(/\s+/g, " ").trim();
const lower = normalized.toLowerCase();

/** @type {{ re: RegExp; reason: string }[]} */
const denyPatterns = [
  {
    re: /\bgit\s+push\b[^\n]*\s(--force|-f)\b[^\n]*\b(main|master)\b/i,
    reason: "Blocked: force-push to main/master is not allowed by project hooks.",
  },
  {
    re: /\bgit\s+push\b[^\n]*\b(main|master)\b[^\n]*\s(--force|-f)\b/i,
    reason: "Blocked: force-push to main/master is not allowed by project hooks.",
  },
  {
    re: /\brm\s+(-[a-zA-Z]*f[a-zA-Z]*|--force)\s+[^\n]*\/\s*$/i,
    reason: "Blocked: recursive force delete of filesystem root.",
  },
  {
    re: /\bformat\s+[a-z]:\b/i,
    reason: "Blocked: disk format command.",
  },
  {
    re: /\bremove-item\b[^\n]*\b(-recurse|-r)\b[^\n]*\b(-force|-f)\b[^\n]*[a-z]:\\\s*$/i,
    reason: "Blocked: recursive force delete of a drive root.",
  },
];

for (const { re, reason } of denyPatterns) {
  if (re.test(normalized) || re.test(lower)) {
    deny(reason);
  }
}

allow();

#!/usr/bin/env node
/* eslint-disable no-console */
// Minimal Node version guard. Keep syntax compatible with very old Node (no optional chaining, no ESM).

function parseVersion(v) {
  var parts = String(v).split('.');
  return {
    major: parseInt(parts[0] || '0', 10),
    minor: parseInt(parts[1] || '0', 10),
    patch: parseInt(parts[2] || '0', 10),
  };
}

function gte(a, b) {
  if (a.major !== b.major) return a.major > b.major;
  if (a.minor !== b.minor) return a.minor >= b.minor;
  return a.patch >= b.patch;
}

var current = parseVersion(process.versions.node);

// Supported ranges from package.json engines: ^20.19.0 OR >=22.12.0
var min20 = { major: 20, minor: 19, patch: 0 };
var min22 = { major: 22, minor: 12, patch: 0 };

var ok = (current.major === 20 && gte(current, min20)) || gte(current, min22);

if (!ok) {
  console.error('\n\x1b[31mUnsupported Node.js version:\x1b[0m ' + process.versions.node);
  console.error('This project requires Node.js ^20.19.0 or >=22.12.0.');
  console.error('\nPlease upgrade Node before running dev server.');
  console.error('Tips:');
  console.error('  - nvm:  nvm install 22 && nvm use 22');
  console.error('  - volta: volta install node@22');
  console.error('\nAfter upgrading, re-run: npm run dev\n');
  process.exit(1);
}

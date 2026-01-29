#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const pkgPath = path.resolve(__dirname, '..', 'package.json');
const relPath = path.relative(process.cwd(), pkgPath).replace(/\\/g, '/');
const args = process.argv.slice(2);
const isPrePush = args.includes('--pre-push');

function safeExec(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8' }).toString();
  } catch (e) {
    return null;
  }
}

function parseJson(content) {
  try {
    return JSON.parse(content);
  } catch (e) {
    return null;
  }
}

function cmpVer(a, b) {
  if (!a || !b) return null;
  const pa = a.split('.').map((s) => parseInt(s.replace(/[^0-9].*$/, ''), 10) || 0);
  const pb = b.split('.').map((s) => parseInt(s.replace(/[^0-9].*$/, ''), 10) || 0);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return 1;
    if ((pa[i] || 0) < (pb[i] || 0)) return -1;
  }
  return 0;
}

(async function main() {
  if (isPrePush) {
    // Try to determine upstream
    let upstream = safeExec('git rev-parse --abbrev-ref --symbolic-full-name @{u}');
    if (upstream) upstream = upstream.trim();
    else upstream = 'origin/main';

    const diff = safeExec(`git diff --name-only ${upstream}...HEAD`);
    if (!diff || !diff.split(/\r?\n/).includes(relPath)) {
      process.exit(0); // package.json not changed between upstream and HEAD
    }

    const baseContent = safeExec(`git show ${upstream}:${relPath}`);
    const basePkg = parseJson(baseContent);
    const newPkg = parseJson(fs.readFileSync(pkgPath, 'utf8'));

    if (!basePkg) {
      // No previous package.json — skip check
      process.exit(0);
    }

    const cmp = cmpVer(newPkg.version, basePkg.version);
    if (cmp === 1) {
      console.log('\u2705 package.json version bumped:', basePkg.version, '->', newPkg.version);
      process.exit(0);
    }

    console.error('\u274C package.json was modified but version was not bumped (', basePkg.version, '->', newPkg.version, ')');
    console.error('Please bump the version (e.g., `pnpm version patch`) before pushing.');
    process.exit(1);
  } else {
    // pre-commit: check staged changes
    const staged = safeExec('git diff --cached --name-only --diff-filter=ACM');
    if (!staged || !staged.split(/\r?\n/).includes(relPath)) {
      process.exit(0); // package.json not staged
    }

    // Read staged version if possible
    let stagedContent = safeExec(`git show :${relPath}`);
    let stagedPkg = parseJson(stagedContent);

    // Fallback to current fs version if not staged (shouldn't happen)
    if (!stagedPkg) stagedPkg = parseJson(fs.readFileSync(pkgPath, 'utf8'));

    const headContent = safeExec(`git show HEAD:${relPath}`);
    const headPkg = parseJson(headContent);

    if (!headPkg) {
      // no previous package.json: allow
      process.exit(0);
    }

    const cmp = cmpVer(stagedPkg.version, headPkg.version);
    if (cmp === 1) {
      console.log('\u2705 package.json version bumped:', headPkg.version, '->', stagedPkg.version);
      process.exit(0);
    }

    console.error('\u274C package.json staged changes detected but version was not bumped (', headPkg.version, '->', stagedPkg.version, ')');
    console.error('Please bump the version before committing (e.g., `pnpm --filter server version patch`).');
    process.exit(1);
  }
})();
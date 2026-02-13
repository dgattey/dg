#!/usr/bin/env tsx
import { spawnSync } from 'node:child_process';
/**
 * Drop bot-authored version bump commits and rebase onto main
 * Usage: tsx src/git-drop-bot-commits.ts [--dry-run]
 */
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { exec, execSafe, fail, fmt, out, spinner } from './lib/utils.js';

const dryRun = process.argv.includes('--dry-run') || process.argv.includes('-n');

// Check branch
const branch = exec('git rev-parse --abbrev-ref HEAD');
if (branch === 'main') fail('Cannot run on main branch');

out(fmt.info(`Current branch: ${branch}`));

// Fetch
const fetchSpinner = spinner('Fetching origin/main...').start();
try {
  exec('git fetch origin main');
  fetchSpinner.succeed('Fetched origin/main');
} catch (e) {
  fetchSpinner.fail('Failed to fetch');
  throw e;
}

// Find bot commits
const searchSpinner = spinner('Searching for bot version bump commits...').start();
const botCommits = execSafe(
  'git log origin/main..HEAD --format="%H" --author="github-actions\\[bot\\]" --grep="^Bump version to v" --extended-regexp',
);

const hashes = botCommits?.split('\n').filter(Boolean) ?? [];
if (hashes.length === 0) {
  searchSpinner.succeed('No bot commits found');
  process.exit(0);
}
searchSpinner.succeed(`Found ${hashes.length} bot commit(s)`);

out(`\n${fmt.bold('Commits to drop:')}`);
for (const h of hashes) {
  out(`  ${fmt.dim(h.slice(0, 8))} ${exec(`git log -1 --format=%s "${h}"`)}`);
}

// Check clean
if (execSafe('git status --porcelain')) {
  fail('Uncommitted changes. Commit or stash first.');
}

if (dryRun) {
  out(
    `\n${fmt.info(`[DRY RUN] Would drop ${hashes.length} commit(s) and rebase onto origin/main`)}`,
  );
  out(fmt.info('[DRY RUN] Then: git push --force-with-lease'));
  process.exit(0);
}

// Rebase
const rebaseSpinner = spinner('Rebasing without bot commits...').start();
const tmpDir = mkdtempSync(join(tmpdir(), 'dg-drop-'));

try {
  writeFileSync(join(tmpDir, 'commits.txt'), hashes.join('\n'), 'utf8');

  const editor = `#!/usr/bin/env bash
set -euo pipefail
awk -v list="${join(tmpDir, 'commits.txt')}" '
  BEGIN { while ((getline < list) > 0) drop[$1] = 1 }
  /^[a-z]+ / {
    for (i = 2; i <= NF; i++) {
      if ($i ~ /^[0-9a-f]{7,}$/) {
        for (d in drop) if (index($i, d) == 1 || index(d, $i) == 1) { sub(/^[a-z]+/, "drop"); break }
        break
      }
    }
  }
  { print }
' "$1" > "$1.tmp" && mv "$1.tmp" "$1"`;

  writeFileSync(join(tmpDir, 'editor.sh'), editor, 'utf8');
  chmodSync(join(tmpDir, 'editor.sh'), '755');

  const result = spawnSync('git', ['rebase', '-i', '--rebase-merges', 'origin/main'], {
    env: { ...process.env, GIT_SEQUENCE_EDITOR: join(tmpDir, 'editor.sh') },
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    rebaseSpinner.fail('Rebase failed');
    fail('Resolve conflicts manually');
  }

  rebaseSpinner.succeed('Rebase complete');
} finally {
  rmSync(tmpDir, { force: true, recursive: true });
}

out(`\n${fmt.success('Done!')}`);
out(fmt.bold('\nNext steps:'));
out(`  1. Verify: ${fmt.dim('git log origin/main..HEAD')}`);
out(`  2. Push: ${fmt.dim('git push --force-with-lease')}`);

import { execSync, spawnSync } from 'node:child_process';
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Command, Flags } from '@oclif/core';
import { createSpinner, format, output } from '../../lib/spinner.js';

function exec(cmd: string): string {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function execSafe(cmd: string): string | null {
  try {
    return exec(cmd);
  } catch {
    return null;
  }
}

export default class GitDropBotCommits extends Command {
  static override description = 'Drop bot-authored version bump commits and rebase onto main';

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --dry-run',
  ];

  static override flags = {
    'dry-run': Flags.boolean({
      char: 'n',
      description: 'Show what would be done without making changes',
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(GitDropBotCommits);

    // Check branch
    const branch = exec('git rev-parse --abbrev-ref HEAD');
    if (branch === 'main') {
      throw new Error('Cannot run on main branch');
    }

    output(format.info(`Current branch: ${branch}`));

    // Fetch origin/main
    const fetchSpinner = createSpinner('Fetching origin/main...').start();
    try {
      execSync('git fetch origin main', { stdio: 'ignore' });
      fetchSpinner.succeed('Fetched origin/main');
    } catch (error) {
      fetchSpinner.fail('Failed to fetch origin/main');
      throw error;
    }

    // Find bot commits
    const searchSpinner = createSpinner(
      'Searching for bot-authored version bump commits...',
    ).start();
    const botCommits = execSafe(
      'git log origin/main..HEAD --format="%H" --author="github-actions\\[bot\\]" --grep="^Bump version to v" --extended-regexp',
    );

    if (!botCommits) {
      searchSpinner.succeed('No bot commits found. Nothing to do.');
      return;
    }

    const commitHashes = botCommits.split('\n').filter(Boolean);
    if (commitHashes.length === 0) {
      searchSpinner.succeed('No bot commits found. Nothing to do.');
      return;
    }

    searchSpinner.succeed(`Found ${commitHashes.length} bot commit(s)`);

    // Show found commits
    output('');
    output(format.bold('Bot commits to drop:'));
    for (const hash of commitHashes) {
      const subject = exec(`git log -1 --format=%s "${hash}"`);
      output(`  ${format.dim(hash.slice(0, 8))} ${subject}`);
    }
    output('');

    // Check for uncommitted changes
    const status = execSafe('git status --porcelain');
    if (status) {
      throw new Error('You have uncommitted changes. Commit or stash them first.');
    }

    if (flags['dry-run']) {
      output(
        format.info(
          `[DRY RUN] Would rebase onto origin/main, dropping ${commitHashes.length} commit(s)`,
        ),
      );
      output(format.info('[DRY RUN] Then force push with: git push --force-with-lease'));
      return;
    }

    // Perform rebase
    const rebaseSpinner = createSpinner('Rebasing branch without bot commits...').start();

    const tmpDir = mkdtempSync(join(tmpdir(), 'dg-drop-bot-'));
    const listFile = join(tmpDir, 'commits.txt');
    const editorFile = join(tmpDir, 'editor.sh');

    try {
      // Write commit list
      writeFileSync(listFile, commitHashes.join('\n'), 'utf8');

      // Create editor script
      const editorScript = `#!/usr/bin/env bash
set -euo pipefail
todo_file="$1"
list_file="${listFile}"

awk -v list="$list_file" '
  function should_drop(hash,   d) {
    if (hash == "") return 0
    for (d in drop) {
      if (index(hash, d) == 1 || index(d, hash) == 1) {
        return 1
      }
    }
    return 0
  }
  BEGIN {
    while ((getline < list) > 0) {
      drop[$1] = 1
    }
    close(list)
  }
  /^[a-z]+ / {
    hash = ""
    for (i = 2; i <= NF; i++) {
      if ($i ~ /^[0-9a-f]{7,}$/) {
        hash = $i
        break
      }
    }
    if (hash != "" && $1 !~ /^(merge|label|reset|exec)$/ && should_drop(hash)) {
      sub(/^[a-z]+/, "drop")
    }
  }
  { print }
' "$todo_file" > "\${todo_file}.tmp"
mv "\${todo_file}.tmp" "$todo_file"
`;

      writeFileSync(editorFile, editorScript, 'utf8');
      chmodSync(editorFile, '755');

      // Run rebase
      const result = spawnSync('git', ['rebase', '-i', '--rebase-merges', 'origin/main'], {
        env: { ...process.env, GIT_SEQUENCE_EDITOR: editorFile },
        stdio: 'inherit',
      });

      if (result.status !== 0) {
        rebaseSpinner.fail('Rebase failed');
        throw new Error('Rebase failed. You may need to resolve conflicts manually.');
      }

      rebaseSpinner.succeed('Rebase completed');
    } finally {
      rmSync(tmpDir, { force: true, recursive: true });
    }

    output('');
    output(format.success('Rebase completed!'));
    output('');
    output(format.bold('Next steps:'));
    output(`  1. Verify: ${format.dim('git log origin/main..HEAD')}`);
    output(`  2. Force push: ${format.dim('git push --force-with-lease')}`);
    output('  3. The PR will get a new version bump automatically');
  }
}

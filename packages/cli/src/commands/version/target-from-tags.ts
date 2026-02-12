import { execSync } from 'node:child_process';
import { Args, Command } from '@oclif/core';
import { output } from '../../lib/spinner.js';

type ReleaseType = 'major' | 'minor' | 'patch';

function computeNext(baseVersion: string, releaseType: ReleaseType): string {
  const normalizedVersion = baseVersion.split('-')[0] ?? baseVersion;
  const parts = normalizedVersion.split('.').map(Number);

  if (parts.length !== 3 || parts.some((p) => Number.isNaN(p))) {
    throw new Error(`Invalid version: ${baseVersion}`);
  }

  let [major, minor, patch] = parts as [number, number, number];

  if (releaseType === 'major') {
    major++;
    minor = 0;
    patch = 0;
  } else if (releaseType === 'minor') {
    minor++;
    patch = 0;
  } else {
    patch++;
  }

  return `${major}.${minor}.${patch}`;
}

function getLatestTagVersion(): string | null {
  try {
    const gitOutput = execSync('git tag --list --sort=-v:refname', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const tags = gitOutput
      .split('\n')
      .map((tag) => tag.trim())
      .filter(Boolean);
    const match = tags.find((tag) => /^v?\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(tag));
    return match ? match.replace(/^v/, '') : null;
  } catch {
    return null;
  }
}

export default class VersionTargetFromTags extends Command {
  static override args = {
    currentVersion: Args.string({
      description: 'The current version (fallback if no tags found)',
      required: true,
    }),
    releaseType: Args.string({
      description: 'The type of release (major, minor, or patch)',
      options: ['major', 'minor', 'patch'],
      required: true,
    }),
  };

  static override description = 'Compute target version from repository tags';

  static override examples = ['<%= config.bin %> <%= command.id %> 1.0.0 minor'];

  public async run(): Promise<void> {
    const { args } = await this.parse(VersionTargetFromTags);

    const baseVersion = getLatestTagVersion() ?? args.currentVersion;
    const newVersion = computeNext(baseVersion, args.releaseType as ReleaseType);

    output(`BASE_VERSION_USED=${baseVersion}`);
    output(`VERSION_FROM=${baseVersion}`);
    output(`VERSION_TO=${newVersion}`);
  }
}

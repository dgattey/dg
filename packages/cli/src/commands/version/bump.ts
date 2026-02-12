import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Args, Command } from '@oclif/core';
import { output, withSpinner } from '../../lib/spinner.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function findRoot(): string {
  let dir = __dirname;
  for (let i = 0; i < 10; i++) {
    if (existsSync(join(dir, 'package.json')) && existsSync(join(dir, 'turbo.json'))) {
      return dir;
    }
    dir = dirname(dir);
  }
  throw new Error('Could not find repository root');
}

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

export default class VersionBump extends Command {
  static override args = {
    baseVersion: Args.string({
      description: 'The base version to bump from',
      required: true,
    }),
    releaseType: Args.string({
      description: 'The type of release (major, minor, or patch)',
      options: ['major', 'minor', 'patch'],
      required: true,
    }),
  };

  static override description = 'Bump the version in package.json';

  static override examples = ['<%= config.bin %> <%= command.id %> 1.0.0 minor'];

  public async run(): Promise<void> {
    const { args } = await this.parse(VersionBump);

    const root = findRoot();
    const pkgPath = join(root, 'package.json');

    const newVersion = computeNext(args.baseVersion, args.releaseType as ReleaseType);

    await withSpinner(
      `Bumping version from ${args.baseVersion}`,
      () => {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
        pkg.version = newVersion;
        writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
      },
      { successText: 'Version bumped' },
    );

    output(`VERSION_FROM=${args.baseVersion}`);
    output(`VERSION_TO=${newVersion}`);
  }
}

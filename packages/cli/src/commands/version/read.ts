import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from '@oclif/core';
import { output } from '../../lib/spinner.js';

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

export default class VersionRead extends Command {
  static override description = 'Read the current version from package.json';

  static override examples = ['<%= config.bin %> <%= command.id %>'];

  public async run(): Promise<void> {
    await this.parse(VersionRead);
    const root = findRoot();
    const pkgPath = join(root, 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    output(`VERSION=${pkg.version}`);
  }
}

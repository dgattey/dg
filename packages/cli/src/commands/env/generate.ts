import { execSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command, Flags } from '@oclif/core';
import { createSpinner, format, log, output, withSpinner } from '../../lib/spinner.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function findRoot(): string {
  // Navigate from packages/cli/dist/commands/env up to repo root
  let dir = __dirname;
  for (let i = 0; i < 10; i++) {
    if (existsSync(join(dir, 'package.json')) && existsSync(join(dir, 'turbo.json'))) {
      return dir;
    }
    dir = dirname(dir);
  }
  throw new Error('Could not find repository root');
}

export default class EnvGenerate extends Command {
  static override description = 'Generate .env file from 1Password secrets';

  static override examples = ['<%= config.bin %> <%= command.id %>'];

  static override flags = {
    force: Flags.boolean({
      char: 'f',
      description: 'Force regeneration even if .env exists with correct keys',
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(EnvGenerate);

    const root = findRoot();
    const outputFile = join(root, '.env');
    const keysFile = join(root, 'config', 'env.secrets.keys');

    // Check if 1Password CLI is available
    const opAvailable = this.checkOpCli();
    if (!opAvailable) {
      log(format.warning('1Password CLI not found, skipping .env generation'));
      return;
    }

    // Read keys from the keys file
    const keys = this.readKeys(keysFile);
    if (keys.length === 0) {
      throw new Error(`No keys found in ${keysFile}`);
    }

    // Check if .env exists with correct keys (unless force flag)
    if (!flags.force && existsSync(outputFile)) {
      const existingKeys = this.getExistingKeys(outputFile);
      const expectedKeys = [...keys].sort().join('\n');
      if (existingKeys === expectedKeys) {
        log(format.success('.env already exists with correct keys'));
        return;
      }
      log(format.info('.env keys mismatch, regenerating...'));
    }

    // Remove old .env if regenerating
    if (existsSync(outputFile)) {
      rmSync(outputFile);
    }

    // Ensure 1Password auth
    this.ensure1PasswordAuth();

    // Fetch secrets with spinner
    const secrets = await withSpinner(
      'Fetching secrets from 1Password',
      (spinner) => {
        const results: Record<string, string> = {};
        const missing: Array<string> = [];

        // Fetch all keys synchronously (op CLI is fast with caching)
        for (const key of keys) {
          try {
            const value = execSync(`op read "op://dg/${key}/value"`, {
              encoding: 'utf8',
              stdio: ['ignore', 'pipe', 'ignore'],
            }).trim();
            results[key] = value;
          } catch {
            missing.push(key);
          }
        }
        spinner.text = `Fetched ${Object.keys(results).length}/${keys.length} secrets`;

        if (missing.length > 0) {
          throw new Error(
            `The following keys were not found in 1Password vault 'dg':\n${missing.map((k) => `  - ${k}`).join('\n')}\n\nTo fix: Add each missing key as an item in 1Password vault 'dg' with the value in a field named 'value'`,
          );
        }

        return results;
      },
      { successText: `Fetched ${keys.length} secrets from 1Password` },
    );

    // Write .env file
    const envContent = keys
      .map((key) => {
        let value = secrets[key] ?? '';
        // Escape for .env format
        value = value.replace(/\\/g, '\\\\');
        value = value.replace(/"/g, '\\"');
        value = value.replace(/\n/g, '\\n');
        return `${key}="${value}"`;
      })
      .join('\n');

    writeFileSync(outputFile, `${envContent}\n`, 'utf8');
    output(format.success('Generated .env'));
  }

  private checkOpCli(): boolean {
    try {
      execSync('command -v op', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  private readKeys(keysFile: string): Array<string> {
    const content = readFileSync(keysFile, 'utf8');
    return content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'));
  }

  private getExistingKeys(envFile: string): string {
    const content = readFileSync(envFile, 'utf8');
    return content
      .split('\n')
      .filter((line) => !line.startsWith('#') && line.includes('='))
      .map((line) => line.split('=')[0])
      .filter((k): k is string => Boolean(k))
      .sort()
      .join('\n');
  }

  private ensure1PasswordAuth(): void {
    const account = 'my.1password.com';
    process.env.OP_ACCOUNT = account;

    try {
      execSync('op whoami', { stdio: 'ignore' });
    } catch {
      const spinner = createSpinner('Signing in to 1Password...').start();
      try {
        execSync(`op signin --account "${account}"`, { stdio: 'inherit' });
        spinner.succeed('Signed in to 1Password');
      } catch {
        spinner.fail('1Password sign-in failed');
        throw new Error(
          '1Password sign-in failed. Enable: 1Password > Settings > Developer > Integrate with 1Password CLI',
        );
      }
    }
  }
}

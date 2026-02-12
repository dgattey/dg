import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command, Flags } from '@oclif/core';
import { format, log, output } from '../../lib/spinner.js';

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

function loadEnv(root: string): void {
  const envFile = join(root, '.env');
  if (!existsSync(envFile)) {
    return;
  }

  const content = readFileSync(envFile, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex);
    let value = trimmed.slice(eqIndex + 1);

    // Remove surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // Unescape
    value = value.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');

    process.env[key] = value;
  }
}

export default class Tunnel extends Command {
  static override description = 'Start a Cloudflare tunnel for local development';

  static override examples = ['<%= config.bin %> <%= command.id %>'];

  static override flags = {
    'log-level': Flags.string({
      char: 'l',
      default: 'warn',
      description: 'Cloudflared log level',
      options: ['debug', 'info', 'warn', 'error', 'fatal'],
    }),
    'transport-log-level': Flags.string({
      char: 't',
      default: 'error',
      description: 'Cloudflared transport log level',
      options: ['debug', 'info', 'warn', 'error', 'fatal'],
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Tunnel);

    const root = findRoot();
    loadEnv(root);

    const token = process.env.CLOUDFLARE_TUNNEL_TOKEN;
    if (!token) {
      log(format.error('CLOUDFLARE_TUNNEL_TOKEN not set'));
      log(format.dim('Add it to 1Password and run `turbo env` to regenerate .env'));
      this.exit(1);
    }

    const logLevel = process.env.CLOUDFLARED_LOGLEVEL ?? flags['log-level'];
    const transportLogLevel =
      process.env.CLOUDFLARED_TRANSPORT_LOGLEVEL ?? flags['transport-log-level'];

    // Set environment variables for cloudflared
    process.env.TUNNEL_LOGLEVEL = logLevel;
    process.env.TUNNEL_TRANSPORT_LOGLEVEL = transportLogLevel;

    output(
      format.info(
        `Starting cloudflared tunnel (loglevel=${logLevel}, transport=${transportLogLevel})`,
      ),
    );

    // Spawn cloudflared as a child process (exec replacement for long-running)
    const child = spawn('cloudflared', ['tunnel', 'run', '--token', token], {
      env: process.env,
      stdio: 'inherit',
    });

    // Handle signals to gracefully terminate
    process.on('SIGINT', () => {
      child.kill('SIGINT');
    });
    process.on('SIGTERM', () => {
      child.kill('SIGTERM');
    });

    // Wait for process to exit
    child.on('exit', (code) => {
      this.exit(code ?? 0);
    });
  }
}

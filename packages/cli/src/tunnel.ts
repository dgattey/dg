#!/usr/bin/env tsx
/**
 * Start Cloudflare tunnel for local development
 * Usage: tsx src/tunnel.ts
 */
import { spawn } from 'node:child_process';
import { fail, findRoot, fmt, loadEnv, out } from './lib/utils.js';

loadEnv(findRoot());

const token = process.env.CLOUDFLARE_TUNNEL_TOKEN;
if (!token) {
  fail('CLOUDFLARE_TUNNEL_TOKEN not set. Add to 1Password and run `turbo env`');
}

const logLevel = process.env.CLOUDFLARED_LOGLEVEL ?? 'warn';
const transportLogLevel = process.env.CLOUDFLARED_TRANSPORT_LOGLEVEL ?? 'error';

process.env.TUNNEL_LOGLEVEL = logLevel;
process.env.TUNNEL_TRANSPORT_LOGLEVEL = transportLogLevel;

out(fmt.info(`Starting cloudflared tunnel (loglevel=${logLevel}, transport=${transportLogLevel})`));

const child = spawn('cloudflared', ['tunnel', 'run', '--token', token], {
  env: process.env,
  stdio: 'inherit',
});

process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
child.on('exit', (code) => process.exit(code ?? 0));

import 'server-only';

import crypto from 'node:crypto';
import { timingSafeEqualStrings } from '../auth/devConsoleBasicAuth';

export const SAGA_TIMESTAMP_HEADER = 'x-saga-timestamp' as const;
export const SAGA_SIGNATURE_HEADER = 'x-saga-signature' as const;
const SAGA_HMAC_REPLAY_WINDOW_MS = 5 * 60 * 1000;

type SagaRequestAuthResult =
  | { method: 'bearer' | 'hmac'; ok: true }
  | {
      ok: false;
      reason:
        | 'expired_timestamp'
        | 'invalid_bearer_token'
        | 'invalid_hmac_signature'
        | 'invalid_timestamp'
        | 'missing_credentials'
        | 'missing_secret';
    };

export function computeSagaHmacSignature(opts: {
  method?: string;
  pathname?: string;
  rawBody?: string;
  secret: string;
  timestamp: string;
}): string {
  const { method = '', pathname = '', rawBody = '', secret, timestamp } = opts;
  const msg =
    method && pathname
      ? `${timestamp}.${method.trim().toUpperCase()}.${pathname}.${rawBody}`
      : `${timestamp}.${rawBody}`;
  return crypto.createHmac('sha256', secret).update(msg, 'utf8').digest('hex');
}

export function verifySagaRequestAuth(opts: {
  authorizationHeader?: string | null;
  env?: NodeJS.ProcessEnv;
  method?: string;
  nowMs?: number;
  pathname?: string;
  rawBody?: string;
  signatureHeader?: string | null;
  timestampHeader?: string | null;
}): SagaRequestAuthResult {
  const {
    authorizationHeader,
    env = process.env,
    method = '',
    nowMs = Date.now(),
    pathname = '',
    rawBody = '',
    signatureHeader,
    timestampHeader,
  } = opts;
  const secrets = [env.SAGA_API_SECRET, env.CRON_SECRET]
    .map((s) => (s ?? '').trim())
    .filter(Boolean);
  if (secrets.length === 0) return { ok: false, reason: 'missing_secret' };

  const sig = (signatureHeader ?? '').trim();
  const ts = (timestampHeader ?? '').trim();
  if (sig || ts) {
    if (!sig || !ts) return { ok: false, reason: 'invalid_hmac_signature' };
    const tsNum = /^\d+$/.test(ts) ? Number.parseInt(ts, 10) : Number.NaN;
    const tsMs =
      Number.isSafeInteger(tsNum) && tsNum > 0
        ? ts.length <= 10
          ? tsNum * 1000
          : tsNum
        : Date.parse(ts);
    if (Number.isNaN(tsMs)) return { ok: false, reason: 'invalid_timestamp' };
    if (Math.abs(nowMs - tsMs) > SAGA_HMAC_REPLAY_WINDOW_MS)
      return { ok: false, reason: 'expired_timestamp' };
    const hex = sig.replace(/^sha256=/i, '').toLowerCase();
    if (!/^[0-9a-f]{64}$/.test(hex)) return { ok: false, reason: 'invalid_hmac_signature' };
    const ok = secrets.some(
      (secret) =>
        timingSafeEqualStrings(
          hex,
          computeSagaHmacSignature({ method, pathname, rawBody, secret, timestamp: ts }),
        ) ||
        timingSafeEqualStrings(hex, computeSagaHmacSignature({ rawBody, secret, timestamp: ts })),
    );
    return ok ? { method: 'hmac', ok: true } : { ok: false, reason: 'invalid_hmac_signature' };
  }

  const token =
    (authorizationHeader ?? '')
      .trim()
      .match(/^Bearer\s+(.+)$/i)?.[1]
      ?.trim() ?? '';
  if (!authorizationHeader?.trim()) return { ok: false, reason: 'missing_credentials' };
  if (!token) return { ok: false, reason: 'invalid_bearer_token' };
  return secrets.some((s) => timingSafeEqualStrings(token, s))
    ? { method: 'bearer', ok: true }
    : { ok: false, reason: 'invalid_bearer_token' };
}

import { MaskedError } from '../errors/MaskedError';

/**
 * Keys that indicate sensitive values requiring masking.
 * Checked case-insensitively against object keys.
 */
const SENSITIVE_KEYS = [
  'authorization',
  'token',
  'secret',
  'password',
  'code',
  'key',
  'verify_token',
] as const;

/** Minimum visible chars on each side of masked value */
const VISIBLE_CHARS = 3;

/** Minimum length to show partial value (otherwise just ***) */
const MIN_LENGTH_FOR_PARTIAL = VISIBLE_CHARS * 2 + 1;

/**
 * Patterns for masking embedded secrets in text (error messages, stacks, etc.)
 * These handle cases where secrets appear within larger strings.
 */
const TEXT_PATTERNS = [
  [/Bearer\s+[A-Za-z0-9-_.]+/gi, 'Bearer ***'],
  [/"(access_token|refresh_token|token|secret)"\s*:\s*"[^"]+"/gi, '"$1":"***"'],
  [/(access_token|refresh_token|token|secret)=([^&\s]+)/gi, '$1=***'],
] as const;

/**
 * Checks if a key indicates a sensitive value that should be masked.
 */
const isSensitiveKey = (key: string): boolean => {
  const normalized = key.toLowerCase();
  return SENSITIVE_KEYS.some((sensitive) => normalized.includes(sensitive));
};

/**
 * Masks embedded secrets within text using pattern matching.
 * Used for error messages and stack traces where secrets may appear inline.
 */
const maskEmbeddedSecrets = (value: string): string =>
  TEXT_PATTERNS.reduce(
    (result, [pattern, replacement]) => result.replace(pattern, replacement),
    value,
  );

/**
 * Masks a single secret string value.
 * Shows first 3 + last 3 chars for longer values, or *** for short values.
 *
 * @example
 * maskSecretValue('abc123xyz') // 'abc...xyz'
 * maskSecretValue('short') // '***'
 * maskSecretValue('Bearer xyz123') // 'Bearer ***' (pattern match)
 */
export function maskSecretValue(value: string): string;
export function maskSecretValue(value: string | null | undefined): string | null | undefined;
export function maskSecretValue(value: string | null | undefined): string | null | undefined {
  if (!value) {
    return value;
  }

  // First try pattern-based masking for embedded secrets
  const patternMasked = maskEmbeddedSecrets(value);
  if (patternMasked !== value) {
    return patternMasked;
  }

  // For short values, just mask entirely
  if (value.length < MIN_LENGTH_FOR_PARTIAL) {
    return '***';
  }

  // Show first 3 + last 3 chars
  return `${value.slice(0, VISIBLE_CHARS)}...${value.slice(-VISIBLE_CHARS)}`;
}

/**
 * Converts an Error to a MaskedError with secrets removed from message/stack.
 * Only applies pattern matching (Bearer tokens, etc.) - doesn't fully mask
 * since error messages may contain useful debugging info.
 */
export const serializeError = (error: Error): MaskedError =>
  new MaskedError(
    maskEmbeddedSecrets(error.message),
    error.name,
    error.stack ? maskEmbeddedSecrets(error.stack) : undefined,
  );

/**
 * Checks if a value looks like a fetch Response (has status + headers/ok).
 * These objects are large and noisy in logs, so we strip them down.
 */
const isResponseLike = (value: unknown): value is { status: number } => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  if (typeof Response !== 'undefined' && value instanceof Response) {
    return true;
  }
  const record = value as Record<string, unknown>;
  return typeof record.status === 'number' && ('headers' in record || 'ok' in record);
};

/**
 * Recursively masks sensitive values in an object or array.
 * - Masks string values where the key matches SENSITIVE_KEYS
 * - Handles Error objects by serializing and masking
 * - Handles Response objects by extracting just status
 * - Handles URLSearchParams by converting to object
 * - Preserves structure and types
 *
 * @example
 * maskSecrets({ accessToken: 'secret123abc', name: 'test' })
 * // { accessToken: 'sec...abc', name: 'test' }
 */
export function maskSecrets<T>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }

  // Handle Error objects
  if (value instanceof Error) {
    return serializeError(value) as T;
  }

  // Handle Response-like objects - just extract status
  if (isResponseLike(value)) {
    return { status: value.status } as T;
  }

  // Handle URLSearchParams - convert to object and mask
  if (value instanceof URLSearchParams) {
    const obj: Record<string, string> = {};
    for (const [key, val] of value.entries()) {
      obj[key] = isSensitiveKey(key) ? maskSecretValue(val) : val;
    }
    return obj as T;
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.map((item) => maskSecrets(item)) as T;
  }

  // Handle plain objects
  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      if (typeof val === 'string') {
        // Mask string values with sensitive keys
        result[key] = isSensitiveKey(key) ? maskSecretValue(val) : val;
      } else {
        // Recurse for nested objects/arrays
        result[key] = maskSecrets(val);
      }
    }
    return result as T;
  }

  // Primitives pass through unchanged
  return value;
}

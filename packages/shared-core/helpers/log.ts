/** Optional key-value metadata to include with log messages. */
type LogMeta = Record<string, unknown> | undefined;

/** Log levels supported by console. */
type LogLevel = 'info' | 'error' | 'warn';

/** Shape of a Response or Response-like object we want to sanitize. */
interface ResponseLike {
  status: number;
  headers?: unknown;
  ok?: unknown;
}

/**
 * Checks if a value looks like a fetch Response (has status + headers/ok).
 * These objects are large and noisy in logs, so we strip them down.
 */
const isResponseLike = (value: unknown): value is ResponseLike => {
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
 * Replaces Response-like objects with just their status code.
 * Only operates on top-level meta values.
 */
const sanitizeMeta = (meta: LogMeta): LogMeta => {
  if (!meta) {
    return meta;
  }
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    result[key] = isResponseLike(value) ? { status: value.status } : value;
  }
  return result;
};

/** Writes a log message to the console with sanitized metadata. */
const logToConsole = (level: LogLevel, message: string, meta?: LogMeta) => {
  // biome-ignore lint/suspicious/noConsole: intentional console logging
  console[level](message, sanitizeMeta(meta));
};

/** Simple logger that sanitizes Response objects in metadata. */
export const log = {
  error: (message: string, meta?: LogMeta) => logToConsole('error', message, meta),
  info: (message: string, meta?: LogMeta) => logToConsole('info', message, meta),
  warn: (message: string, meta?: LogMeta) => logToConsole('warn', message, meta),
};

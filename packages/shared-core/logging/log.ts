import { maskSecrets } from './maskSecrets';

/** Optional key-value metadata to include with log messages. */
type LogMeta = Record<string, unknown> | undefined;

/** Log levels supported by console. */
type LogLevel = 'info' | 'error' | 'warn';

/** Writes a log message to the console with sanitized metadata. */
const logToConsole = (level: LogLevel, message: string, meta?: LogMeta) => {
  // biome-ignore lint/suspicious/noConsole: intentional console logging
  console[level](message, maskSecrets(meta));
};

/** Simple logger that automatically masks sensitive values in metadata. */
export const log = {
  error: (message: string, meta?: LogMeta) => logToConsole('error', message, meta),
  info: (message: string, meta?: LogMeta) => logToConsole('info', message, meta),
  warn: (message: string, meta?: LogMeta) => logToConsole('warn', message, meta),
};

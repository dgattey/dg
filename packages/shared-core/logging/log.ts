import { maskSecrets } from './maskSecrets';

/** Optional key-value metadata to include with log messages. */
type LogMeta = Record<string, unknown>;
type LogFunction = (message: string, meta?: LogMeta) => void;

/** Logs message with optional masked metadata. Only includes meta if provided. */
const createLogFn =
  (consoleFn: typeof console.info): LogFunction =>
  (message, meta) => {
    if (meta !== undefined) {
      consoleFn(message, maskSecrets(meta));
    } else {
      consoleFn(message);
    }
  };

/** Simple logger that automatically masks sensitive values in metadata. */
export const log: Record<'error' | 'info' | 'warn', LogFunction> = {
  error: createLogFn(console.error),
  info: createLogFn(console.info),
  warn: createLogFn(console.warn),
};

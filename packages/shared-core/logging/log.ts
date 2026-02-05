import { maskSecrets } from './maskSecrets';

/** Optional key-value metadata to include with log messages. */
type LogMeta = Record<string, unknown>;
type LogFunction = (message: string, meta?: LogMeta) => void;

/** Simple logger that automatically masks sensitive values in metadata. */
export const log: Record<'error' | 'info' | 'warn', LogFunction> = {
  error: (message, meta) => console.error(message, maskSecrets(meta)),
  info: (message, meta) => console.info(message, maskSecrets(meta)),
  warn: (message, meta) => console.warn(message, maskSecrets(meta)),
};

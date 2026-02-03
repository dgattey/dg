type MaskSecretOptions = {
  forceMask?: boolean;
  visibleChars?: number;
};

const DEFAULT_VISIBLE_CHARS = 3;
const TOKEN_MIN_LENGTH = 12;

const patterns = [
  [/Bearer\s+[A-Za-z0-9-_.]+/gi, 'Bearer ***'],
  [/"(access_token|refresh_token|token|secret)"\s*:\s*"[^"]+"/gi, '"$1":"***"'],
  [/(access_token|refresh_token|token|secret)=([^&\s]+)/gi, '$1=***'],
] as const;

const maskSensitiveText = (value: string) =>
  patterns.reduce((result, [pattern, replacement]) => result.replace(pattern, replacement), value);

const isTokenLike = (value: string) =>
  value.length >= TOKEN_MIN_LENGTH &&
  !/\s/.test(value) &&
  /[0-9]/.test(value) &&
  /[A-Za-z]/.test(value);

const resolveOptions = (optionsOrVisibleChars?: number | MaskSecretOptions) => {
  if (typeof optionsOrVisibleChars === 'number') {
    return { visibleChars: optionsOrVisibleChars };
  }
  return optionsOrVisibleChars ?? {};
};

export function maskSecret(
  value: string,
  optionsOrVisibleChars?: number | MaskSecretOptions,
): string;
export function maskSecret(
  value: string | null | undefined,
  optionsOrVisibleChars?: number | MaskSecretOptions,
): string | null | undefined;
export function maskSecret(
  value: string | null | undefined,
  optionsOrVisibleChars?: number | MaskSecretOptions,
) {
  if (!value) {
    return value;
  }

  const { visibleChars = DEFAULT_VISIBLE_CHARS, forceMask = false } =
    resolveOptions(optionsOrVisibleChars);

  const sanitized = maskSensitiveText(value);
  if (sanitized !== value) {
    return sanitized;
  }

  if (!forceMask && !isTokenLike(value)) {
    return value;
  }

  if (value.length <= visibleChars) {
    return value;
  }

  return `${value.slice(0, visibleChars)}...`;
}

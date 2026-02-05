/**
 * Returns true when dev console credentials are configured in the environment
 * via `DEV_CONSOLE_BASIC_AUTH_USER` and `DEV_CONSOLE_BASIC_AUTH_PASS`.
 */
export function hasDevConsoleCredentials(): boolean {
  return Boolean(
    process.env.DEV_CONSOLE_BASIC_AUTH_USER && process.env.DEV_CONSOLE_BASIC_AUTH_PASS,
  );
}

/**
 * Checks whether the given `Authorization` header contains valid Basic Auth
 * credentials matching the configured dev console env vars. Returns false if
 * credentials aren't configured or the header is missing/invalid.
 */
export function isValidDevConsoleAuth(authorizationHeader: string | null): boolean {
  const username = process.env.DEV_CONSOLE_BASIC_AUTH_USER;
  const password = process.env.DEV_CONSOLE_BASIC_AUTH_PASS;

  if (!username || !password || !authorizationHeader) {
    return false;
  }

  if (!authorizationHeader.startsWith('Basic ')) {
    return false;
  }

  const encoded = authorizationHeader.slice('Basic '.length).trim();
  if (!encoded) {
    return false;
  }

  try {
    // atob works in both edge runtime and Node.js (16+)
    const decoded = atob(encoded);
    const separatorIndex = decoded.indexOf(':');
    if (separatorIndex < 0) {
      return false;
    }

    return (
      decoded.slice(0, separatorIndex) === username &&
      decoded.slice(separatorIndex + 1) === password
    );
  } catch {
    return false;
  }
}

/**
 * Returns true when the request should be allowed through to the dev console.
 * In non-production without credentials configured, access is always granted
 * for local development convenience. Framework-agnostic so it works in both
 * Next.js middleware (edge) and server components/actions (Node).
 */
export function isDevConsoleAccessAllowed(authorizationHeader: string | null): boolean {
  if (!hasDevConsoleCredentials()) {
    return process.env.NODE_ENV !== 'production';
  }

  return isValidDevConsoleAuth(authorizationHeader);
}

const encoder = new TextEncoder();

export function timingSafeEqualStrings(
  left: string | null | undefined,
  right: string | null | undefined,
): boolean {
  if (!left || !right) {
    return false;
  }
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);
  let mismatch = leftBytes.length ^ rightBytes.length;
  const maxLength = Math.max(leftBytes.length, rightBytes.length);
  for (let index = 0; index < maxLength; index += 1) {
    const leftByte = index < leftBytes.length ? (leftBytes[index] ?? 0) : 0;
    const rightByte = index < rightBytes.length ? (rightBytes[index] ?? 0) : 0;
    mismatch |= leftByte ^ rightByte;
  }
  return mismatch === 0;
}

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

    const userMatches = timingSafeEqualStrings(decoded.slice(0, separatorIndex), username);
    const passMatches = timingSafeEqualStrings(decoded.slice(separatorIndex + 1), password);
    return userMatches && passMatches;
  } catch {
    return false;
  }
}

/**
 * Returns true when the request should be allowed through to the dev console.
 * When credentials are configured, valid Basic Auth is required in all
 * environments (including local dev) so the auth flow can be tested locally.
 * Without credentials configured, access is granted in non-production for
 * convenience. Framework-agnostic so it works in both Next.js middleware
 * (edge) and server components/actions (Node).
 */
export function isDevConsoleAccessAllowed(authorizationHeader: string | null): boolean {
  if (!hasDevConsoleCredentials()) {
    return process.env.NODE_ENV !== 'production';
  }

  return isValidDevConsoleAuth(authorizationHeader);
}

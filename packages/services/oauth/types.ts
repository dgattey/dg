/**
 * OAuth connection status for a provider.
 */
export type OauthStatus = {
  error: string | null;
  expiresAt: Date | null;
  isConnected: boolean;
};

/**
 * Result of a force refresh token operation.
 */
export type ForceRefreshResult = {
  success: boolean;
  error?: string;
  expiresAt?: Date;
};

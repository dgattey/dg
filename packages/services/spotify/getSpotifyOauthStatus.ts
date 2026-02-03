import { db } from '@dg/db';

export type OauthStatus = {
  error: string | null;
  expiresAt: Date | null;
  isConnected: boolean;
};

/**
 * Returns the current OAuth connection status for Spotify.
 */
export async function getSpotifyOauthStatus(): Promise<OauthStatus> {
  const token = await db.Token.findOne({
    attributes: ['expiryAt', 'refreshToken'],
    where: { name: 'spotify' },
  });

  return {
    error: null,
    expiresAt: token?.expiryAt ?? null,
    isConnected: Boolean(token?.refreshToken),
  };
}

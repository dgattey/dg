export const CACHE_TAGS = {
  changelog: 'changelog',
  contentful: 'contentful',
  favoriteAlbums: 'favorite-albums',
  favoriteAlbumsCheck: 'favorite-albums-check',
  latestActivity: 'latest-activity',
  latestSong: 'latest-song',
  musicHistory: 'music-history',
  musicStats: 'music-stats',
  oauthToken: 'oauth-token',
  socialImage: 'social-image',
  stravaHistory: 'strava-history',
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

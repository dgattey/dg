'use client';

import { useRefreshOnFocus } from '../../hooks/useRefreshOnFocus';

/**
 * Client component that refreshes the Next.js router when the window regains focus.
 * This triggers RSC revalidation, keeping server-fetched data fresh (e.g., Spotify, Strava).
 *
 * Place this in the layout to enable automatic data refresh on tab focus.
 */
export function RefreshOnFocusProvider() {
  useRefreshOnFocus();
  return null;
}

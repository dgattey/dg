'use client';

import { ALBUM_PARAM, favoriteAlbumsRoute } from '@dg/shared-core/routes/app';
import { albumTransitionTypes } from '@dg/ui/core/transitions/pageTransitions';
import { useRouter, useSearchParams } from 'next/navigation';
import type { MouseEvent } from 'react';
import {
  addTransitionType,
  startTransition,
  useEffect,
  useState,
  useSyncExternalStore,
} from 'react';

/**
 * A click the URL has not caught up with yet. `fromAlbumId` records the
 * selection the guess was made against, so any later URL change — the
 * navigation landing, back/forward, a link from elsewhere — retires it rather
 * than letting a guess outlive the click that made it.
 */
export type PendingSelection = {
  albumId: string | null;
  fromAlbumId: string | null;
};

/** The album in the URL. Reading it during prerender postpones the caller. */
export function useUrlAlbumId() {
  return useSearchParams().get(ALBUM_PARAM);
}

/**
 * The server never reads the query for the grid, so the grid can prerender
 * into the static shell instead of postponing whole. Each environment always
 * makes the same hook calls, which is all hook order requires.
 */
const useClientUrlAlbumId: () => string | null =
  typeof window === 'undefined' ? () => null : useUrlAlbumId;

const subscribeToNothing = () => () => {};
const isPastHydration = () => true;
const isServerOrHydrating = () => false;

/**
 * The album in the URL as the static grid may render it: none on the server
 * and through hydration (matching the prerendered tiles), the URL's from the
 * commit after.
 */
function useHydratedUrlAlbumId() {
  const urlAlbumId = useClientUrlAlbumId();
  const hydrated = useSyncExternalStore(subscribeToNothing, isPastHydration, isServerOrHydrating);
  return hydrated ? urlAlbumId : null;
}

/** What the well shows: a live click's guess, else the URL. */
export function resolveAlbumSelection(pending: PendingSelection | null, urlAlbumId: string | null) {
  const liveGuess = pending && pending.fromAlbumId === urlAlbumId ? pending : null;
  const selectedAlbumId = liveGuess ? liveGuess.albumId : urlAlbumId;
  return {
    /** True while the well is open for an album the streamed detail isn't for. */
    isAwaitingDetail: selectedAlbumId !== urlAlbumId,
    selectedAlbumId,
  };
}

/** A left click with no modifiers, i.e. one the browser would navigate for. */
function isPlainNavigationClick(event: MouseEvent<HTMLElement>) {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

/**
 * The albums-route anchor under a click, if the click landed on one that this
 * grid owns. Spotify links in the well and anything opening a new tab are left
 * to the browser.
 */
function albumsRouteAnchor(event: MouseEvent<HTMLElement>) {
  const anchor = event.target instanceof Element ? event.target.closest('a') : null;

  if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) {
    return null;
  }

  const destination = new URL(anchor.href, window.location.href);

  return destination.origin === window.location.origin &&
    destination.pathname === favoriteAlbumsRoute
    ? destination
    : null;
}

/**
 * Which album the well is open for, driven by the click rather than by the URL
 * it produces.
 *
 * The router blocks its own state update on the incoming RSC payload — the app
 * router root `use()`s a promise for it — so on a cold album nothing on screen
 * moves until Spotify answers, and the page's skeleton never gets a chance to
 * show because the well isn't open yet. The click therefore writes the
 * selection in its own transition (so the shared art morph can photograph the
 * open), then asks the router to follow on the next frame. Keeping
 * `router.push` out of the optimistic transition prevents its suspended RSC
 * request from holding the well shut. Back/forward and any other URL change
 * clear the guess so it can never outrank the address bar.
 */
export function useOptimisticAlbumSelection() {
  const router = useRouter();
  const urlAlbumId = useHydratedUrlAlbumId();
  const [pending, setPending] = useState<PendingSelection | null>(null);

  // Retire the guess whenever the URL moves — including when the navigation we
  // started lands, and when the user goes back/forward to somewhere else.
  // Without clearing, a guess whose `fromAlbumId` the user later returns to
  // would come back to life and beat the URL.
  useEffect(() => {
    setPending((current) => (current ? null : current));
    // urlAlbumId is the trigger; the updater ignores the value on purpose.
    void urlAlbumId;
  }, [urlAlbumId]);

  /**
   * Capture-phase handler for the grid: opens or closes the well in an
   * album-typed transition, then hands the same destination to the router once
   * that open has painted so the suspending navigate cannot hold it shut.
   */
  const onAlbumNavigationCapture = (event: MouseEvent<HTMLElement>) => {
    if (!isPlainNavigationClick(event)) {
      return;
    }

    const destination = albumsRouteAnchor(event);

    if (!destination) {
      return;
    }

    const albumId = destination.searchParams.get(ALBUM_PARAM);

    if (albumId === urlAlbumId) {
      return;
    }

    // Next's Link skips its own handler once default is prevented, so the
    // navigation below is the only one that runs.
    event.preventDefault();

    const types = albumTransitionTypes(albumId ? 'open' : 'close');
    const href = `${destination.pathname}${destination.search}`;

    // The selection gets its own transition so React can paint the skeleton and
    // photograph the art morph before navigation starts suspending on the RSC.
    startTransition(() => {
      for (const type of types) {
        addTransitionType(type);
      }
      setPending({ albumId, fromAlbumId: urlAlbumId });
    });

    requestAnimationFrame(() => {
      router.push(href, { transitionTypes: [...types] });
    });
  };

  return {
    onAlbumNavigationCapture,
    pending,
    selectedAlbumId: resolveAlbumSelection(pending, urlAlbumId).selectedAlbumId,
  };
}

'use client';

import { ALBUM_PARAM, albumRoute, favoriteAlbumsRoute } from '@dg/shared-core/routes/app';
import { albumTransitionTypes } from '@dg/ui/core/transitions/pageTransitions';
import { useRouter, useSearchParams } from 'next/navigation';
import type { MouseEvent } from 'react';
import { addTransitionType, startTransition, useEffect, useState } from 'react';

/**
 * A click the URL has not caught up with yet. `fromAlbumId` records the
 * selection the guess was made against, so any later URL change — the
 * navigation landing, back/forward, a link from elsewhere — retires it rather
 * than letting a guess outlive the click that made it.
 */
type PendingSelection = {
  albumId: string | null;
  fromAlbumId: string | null;
};

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

/** True once the optimistic selection has committed to the DOM. */
function selectionCommitted(albumId: string | null) {
  if (albumId === null) {
    return !document.querySelector('section[aria-label$="details"]');
  }
  // Selected cells swap their open link for a close link, so the album href
  // disappearing is the signal the pending selection painted — including when
  // switching from one open album to another (a well was already on screen).
  return (
    Boolean(document.querySelector('section[aria-label$="details"]')) &&
    !document.querySelector(`a[href="${albumRoute(albumId)}"]`)
  );
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
 * open), and only after that open has committed asks the router to follow on a
 * separate task — putting `router.push` in the same transition would suspend
 * that lane and hold the open above shut for the whole fetch. Back/forward and
 * any other URL change clear the guess so it can never outrank the address bar.
 */
export function useOptimisticAlbumSelection() {
  const router = useRouter();
  const urlAlbumId = useSearchParams().get(ALBUM_PARAM);
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

  const liveGuess = pending && pending.fromAlbumId === urlAlbumId ? pending : null;
  const selectedAlbumId = liveGuess ? liveGuess.albumId : urlAlbumId;

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

    // Selection update lives in this transition so React photographs the art
    // morph (cell ↔ well). Do not call `router.push` here — that suspends.
    startTransition(() => {
      for (const type of types) {
        addTransitionType(type);
      }
      setPending({ albumId, fromAlbumId: urlAlbumId });
    });

    let navigated = false;
    const navigate = () => {
      if (navigated) {
        return;
      }
      navigated = true;
      router.push(href, { transitionTypes: [...types] });
    };

    const navigateAfterOpen = () => {
      if (selectionCommitted(albumId)) {
        navigate();
        return;
      }
      requestAnimationFrame(navigateAfterOpen);
    };
    requestAnimationFrame(navigateAfterOpen);
    // If the transition is somehow starved, still navigate — better a late
    // open than a click that never updates the URL.
    window.setTimeout(navigate, 500);
  };

  return {
    /** True while the well is open for an album the streamed detail isn't for. */
    isAwaitingDetail: selectedAlbumId !== urlAlbumId,
    onAlbumNavigationCapture,
    selectedAlbumId,
  };
}

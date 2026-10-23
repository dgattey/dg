'use client';

import { favoriteAlbumsRoute, musicRoute, musicStatsRoute } from '@dg/shared-core/routes/app';
import { PageTransitionLink } from '@dg/ui/core/transitions/PageTransitionLink';
import type { LucideIcon } from 'lucide-react';
import { ChartColumn, ChevronDown, DiscAlbum, History } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { PaperButton, PaperButtonFace } from '../collage/PaperButton';
import { PaperCard } from '../collage/PaperCard';
import {
  isMusicDestinationPath,
  MUSIC_DESTINATIONS,
  normalizeMusicPath,
  READING_DESTINATION,
  STRAVA_DESTINATION,
} from './musicHeaderDestinations';

const DESTINATION_ICONS: Record<string, LucideIcon> = {
  [favoriteAlbumsRoute]: DiscAlbum,
  [musicRoute]: History,
  [musicStatsRoute]: ChartColumn,
};

/**
 * Opens the menu on mouse hover. A ref callback, so the listeners live exactly as long
 * as each keyed `<details>` does.
 */
function bindMusicMenu(details: HTMLDetailsElement | null) {
  const summary = details?.querySelector('summary');
  if (!details || !summary) {
    return;
  }
  /** Hover only closes what hover opened, and a mouse click can't toggle that shut. */
  let openedByHover = false;

  const setOpen = (open: boolean) => {
    details.open = open;
    openedByHover = false;
  };
  const hover = (open: boolean) => (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' || details.open === open) {
      return;
    }
    if (open || openedByHover) {
      details.open = open;
      openedByHover = open;
    }
  };
  const enter = hover(true);
  const leave = hover(false);
  const keepHoverOpen = (event: MouseEvent) => {
    if (openedByHover) {
      event.preventDefault();
    }
  };
  const closeOnEscape = (event: KeyboardEvent) => {
    if (details.open && event.key === 'Escape') {
      setOpen(false);
      summary.focus();
    }
  };
  const closeOnOutsidePress = (event: PointerEvent) => {
    if (details.open && event.target instanceof Node && !details.contains(event.target)) {
      setOpen(false);
    }
  };
  const closeOnLinkClick = (event: MouseEvent) => {
    if (event.target instanceof Element && event.target.closest('a[href]')) {
      setOpen(false);
    }
  };

  details.addEventListener('pointerenter', enter);
  details.addEventListener('pointerleave', leave);
  details.addEventListener('click', closeOnLinkClick);
  summary.addEventListener('click', keepHoverOpen);
  document.addEventListener('keydown', closeOnEscape);
  document.addEventListener('pointerdown', closeOnOutsidePress);
  return () => {
    details.removeEventListener('pointerenter', enter);
    details.removeEventListener('pointerleave', leave);
    details.removeEventListener('click', closeOnLinkClick);
    summary.removeEventListener('click', keepHoverOpen);
    document.removeEventListener('keydown', closeOnEscape);
    document.removeEventListener('pointerdown', closeOnOutsidePress);
  };
}

/**
 * Music → destinations submenu. `<details>` owns the open state so the menu opens and
 * its links work without script; script opens it on mouse hover, and closes it on
 * link click, outside press, and Escape.
 */
export function CollageMusicLinks() {
  const pathname = normalizeMusicPath(usePathname() ?? '/');
  const onMusicPage = isMusicDestinationPath(pathname);
  const isAt = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <details className="chrome__music" ref={bindMusicMenu}>
        <summary className="chrome__musicSummary collageLift">
          <PaperButtonFace current={onMusicPage} tiltDeg={-2}>
            Music
            <ChevronDown aria-hidden={true} className="chrome__musicChevron" size={18} />
          </PaperButtonFace>
        </summary>
        <PaperCard
          className="chrome__musicPanel"
          edge="quad-a"
          innerClassName="chrome__musicPanelInner"
          tiltDeg={-1}
        >
          <ul className="chrome__musicList">
            {MUSIC_DESTINATIONS.map((destination) => {
              const Icon = DESTINATION_ICONS[destination.href];
              const current = pathname === destination.href;
              return (
                <li key={destination.href}>
                  <PageTransitionLink
                    aria-current={current ? 'page' : undefined}
                    className="chrome__musicLink"
                    href={destination.href}
                    title={destination.label}
                  >
                    {Icon ? <Icon aria-hidden={true} size={20} /> : null}
                    {destination.label}
                  </PageTransitionLink>
                </li>
              );
            })}
          </ul>
        </PaperCard>
      </details>
      <div className="collageLift">
        <PaperButton
          current={isAt(READING_DESTINATION.href)}
          href={READING_DESTINATION.href}
          tiltDeg={1.5}
          title={READING_DESTINATION.label}
        >
          {READING_DESTINATION.label}
        </PaperButton>
      </div>
      <div className="collageLift">
        <PaperButton
          current={isAt(STRAVA_DESTINATION.href)}
          href={STRAVA_DESTINATION.href}
          tiltDeg={-1}
          title={STRAVA_DESTINATION.label}
        >
          {STRAVA_DESTINATION.label}
        </PaperButton>
      </div>
    </>
  );
}

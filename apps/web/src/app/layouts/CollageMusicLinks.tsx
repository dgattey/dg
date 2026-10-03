'use client';

import { favoriteAlbumsRoute, musicRoute } from '@dg/shared-core/routes/app';
import { PageTransitionLink } from '@dg/ui/core/transitions/PageTransitionLink';
import type { LucideIcon } from 'lucide-react';
import { ChevronDown, DiscAlbum, History } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import chrome from '../collage/chrome.module.css';
import { PaperCard } from '../collage/PaperCard';
import { cx, paperSurfaceVars } from '../collage/paperVars';
import {
  isMusicDestinationPath,
  MUSIC_DESTINATIONS,
  normalizeMusicPath,
} from './musicHeaderDestinations';

const DESTINATION_ICONS: Record<string, LucideIcon> = {
  [favoriteAlbumsRoute]: DiscAlbum,
  [musicRoute]: History,
};

/**
 * Music → destinations submenu. `<details>` owns the open state so the menu opens and
 * its links work without script; script only closes it on outside press and Escape.
 * Keying on the path remounts it closed after every navigation.
 */
export function CollageMusicLinks() {
  const pathname = normalizeMusicPath(usePathname());
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const onMusicPage = isMusicDestinationPath(pathname);

  useEffect(() => {
    const close = (event: KeyboardEvent | PointerEvent) => {
      const details = detailsRef.current;
      if (!details?.open) {
        return;
      }
      if (event instanceof KeyboardEvent) {
        if (event.key !== 'Escape') {
          return;
        }
        details.open = false;
        details.querySelector('summary')?.focus();
        return;
      }
      if (event.target instanceof Node && !details.contains(event.target)) {
        details.open = false;
      }
    };
    document.addEventListener('keydown', close);
    document.addEventListener('pointerdown', close);
    return () => {
      document.removeEventListener('keydown', close);
      document.removeEventListener('pointerdown', close);
    };
  }, []);

  return (
    <details className={chrome.music} key={pathname} ref={detailsRef}>
      <summary className={chrome.musicSummary}>
        <span className="paperWrap" style={paperSurfaceVars('cream', 'quad-c', -2)}>
          <span className={cx('paperButton', onMusicPage && 'paperButtonCurrent')}>
            Music
            <ChevronDown aria-hidden={true} className={chrome.musicChevron} size={18} />
          </span>
        </span>
      </summary>
      <PaperCard
        className={chrome.musicPanel}
        edge="quad-a"
        innerClassName={chrome.musicPanelInner}
        tiltDeg={-1}
      >
        <ul className={chrome.musicList}>
          {MUSIC_DESTINATIONS.map((destination) => {
            const Icon = DESTINATION_ICONS[destination.href];
            const current = pathname === destination.href;
            return (
              <li key={destination.href}>
                <PageTransitionLink
                  aria-current={current ? 'page' : undefined}
                  className={chrome.musicLink}
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
  );
}

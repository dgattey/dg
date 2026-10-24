'use client';

import { PageTransitionLink } from '@dg/ui/core/transitions/PageTransitionLink';
import { ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { bindHoverMenu } from '../collage/hoverMenu';
import { PaperButton, PaperButtonFace } from '../collage/PaperButton';
import { PaperCard } from '../collage/PaperCard';
import {
  isMusicDestinationPath,
  MUSIC_DESTINATIONS,
  normalizeMusicPath,
  READING_DESTINATION,
  STRAVA_DESTINATION,
} from './musicHeaderDestinations';

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
      <details className="chrome__music" ref={(node) => bindHoverMenu(node, 'a[href]')}>
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
              const Icon = destination.icon;
              const current = pathname === destination.href;
              return (
                <li key={destination.href}>
                  <PageTransitionLink
                    aria-current={current ? 'page' : undefined}
                    className="chrome__musicLink"
                    href={destination.href}
                    title={destination.label}
                  >
                    <Icon aria-hidden={true} size={20} />
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

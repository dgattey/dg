'use client';

import { usePathname } from 'next/navigation';
import { PaperButton } from '../collage/PaperButton';
import { MUSIC_DESTINATIONS, normalizeMusicPath } from './musicHeaderDestinations';

export function CollageMusicLinks() {
  const pathname = normalizeMusicPath(usePathname());

  return (
    <>
      {MUSIC_DESTINATIONS.map((destination, index) => (
        <PaperButton
          current={pathname === destination.href}
          edge="quad-c"
          href={destination.href}
          key={destination.href}
          tiltDeg={index === 0 ? -2 : 2}
          title={destination.label}
        >
          {destination.label}
        </PaperButton>
      ))}
    </>
  );
}

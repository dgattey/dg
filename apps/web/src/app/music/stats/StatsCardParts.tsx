import type { StatsAlbum } from '@dg/services/spotify/fetchListeningStats';
import { Image } from '@dg/ui/dependent/Image';
import type { CSSProperties, ReactNode } from 'react';
import type { PaperTone } from '../../collage/types';

type BarStyle = CSSProperties & { '--bar': string };

export const bar = (part: number, whole: number): BarStyle => ({
  '--bar': whole > 0 ? String(part / whole) : '0',
});

export function Cover({
  album,
  eager = false,
  matTone,
  size,
}: {
  album: StatsAlbum;
  /** For the cover that is often the largest paint, so it never waits on lazy loading. */
  eager?: boolean;
  matTone?: PaperTone;
  size: number;
}) {
  return (
    <span
      className="stats__mat"
      style={matTone ? ({ '--mat-bg': `var(--${matTone})` } as CSSProperties) : undefined}
    >
      <Image
        alt={`${album.name} by ${album.artistNames}`}
        height={size}
        loading={eager ? 'eager' : undefined}
        sizes={{ extraLarge: size }}
        url={album.imageUrl}
        width={size}
      />
    </span>
  );
}

export function CardHead({ aside, title }: { aside?: ReactNode; title: string }) {
  return (
    <div className="stats__head">
      <h2 className="stats__heading">{title}</h2>
      {aside ? <p className="stats__aside">{aside}</p> : null}
    </div>
  );
}

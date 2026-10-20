import type { StatsAlbum } from '@dg/services/spotify/fetchListeningStats';
import { Image } from '@dg/ui/dependent/Image';
import type { CSSProperties, ReactNode } from 'react';

type BarStyle = CSSProperties & { '--bar': string };

export const bar = (part: number, whole: number): BarStyle => ({
  '--bar': whole > 0 ? String(part / whole) : '0',
});

export function Cover({ album, size }: { album: StatsAlbum; size: number }) {
  return (
    <span className="stats__mat">
      <Image
        alt={`${album.name} by ${album.artistNames}`}
        height={size}
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

'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { Image } from '@dg/ui/dependent/Image';
import { Link } from '@dg/ui/dependent/Link';
import { AlbumArtWithNotes } from '../spotify/AlbumArtWithNotes';
import styles from './print.module.css';

type RecordDiscProps = {
  track: Track;
};

export function RecordDisc({ track }: RecordDiscProps) {
  const albumTitle = track.album.name;
  const albumUrl = track.album.externalUrls.spotify;
  const trackUrl = track.externalUrls.spotify;

  return (
    <AlbumArtWithNotes
      isPlaying={Boolean(track.isPlaying)}
      noteColor="var(--cream)"
      wrapperSx={{
        aspectRatio: '1',
        overflow: 'visible',
        position: 'relative',
        width: 'min(100%, 240px)',
      }}
    >
      <div className={styles.disc}>
        <div className={styles.discPiece}>
          <Link
            aria-label="Spotify"
            className={styles.logo}
            href={trackUrl}
            isExternal={true}
            title={track.name}
          >
            <span className={styles.logoMark} />
          </Link>
          <Link className={styles.artLink} href={albumUrl} isExternal={true} title={albumTitle}>
            <span className={styles.art}>
              <Image
                alt={albumTitle}
                cover={true}
                height={track.albumImage.height}
                quality={60}
                sizes={{ extraLarge: 240 }}
                url={track.albumImage.url}
                width={track.albumImage.width}
              />
            </span>
          </Link>
          <span aria-hidden="true" className={styles.hole} />
        </div>
      </div>
    </AlbumArtWithNotes>
  );
}

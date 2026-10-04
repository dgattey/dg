'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { Image } from '@dg/ui/dependent/Image';
import { AlbumArtWithNotes } from '../spotify/AlbumArtWithNotes';

export function RecordDisc({ track }: { track: Track }) {
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
      <div className="print__disc">
        <div className="print__discPiece">
          <a
            aria-label="Spotify"
            className="print__logo"
            href={track.externalUrls.spotify}
            rel="noreferrer"
            target="_blank"
            title={track.name}
          >
            <span className="print__logoMark" />
          </a>
          <a
            aria-label={track.album.name}
            className="print__artLink"
            href={track.album.externalUrls.spotify}
            rel="noreferrer"
            target="_blank"
            title={track.album.name}
          >
            <span className="print__art">
              <Image
                alt={track.album.name}
                cover={true}
                height={track.albumImage.height}
                quality={60}
                sizes={{ extraLarge: 240 }}
                url={track.albumImage.url}
                width={track.albumImage.width}
              />
            </span>
          </a>
          <span aria-hidden="true" className="print__hole" />
        </div>
      </div>
    </AlbumArtWithNotes>
  );
}

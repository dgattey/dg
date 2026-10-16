'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { Image } from '@dg/ui/dependent/Image';
import { AlbumArtWithNotes } from '../spotify/AlbumArtWithNotes';

export function AlbumSleeve({ track }: { track: Track }) {
  return (
    <AlbumArtWithNotes
      isPlaying={Boolean(track.isPlaying)}
      noteColor="var(--cream)"
      notesVariant="collage"
      wrapperSx={{
        aspectRatio: '1',
        overflow: 'visible',
        position: 'relative',
        width: 'min(100%, 300px)',
      }}
    >
      <div className="print__sleeve">
        <div className="print__sleevePiece">
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
                sizes={{ extraLarge: 300 }}
                url={track.albumImage.url}
                width={track.albumImage.width}
              />
            </span>
          </a>
        </div>
      </div>
    </AlbumArtWithNotes>
  );
}

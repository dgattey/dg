'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { Image } from '@dg/ui/dependent/Image';
import { Link } from '@dg/ui/dependent/Link';
import { createBouncyTransition } from '@dg/ui/helpers/bouncyTransition';
import type { SxObject } from '@dg/ui/theme';
import { Card } from '@mui/material';
import { AlbumArtWithNotes } from './AlbumArtWithNotes';
import {
  ALBUM_ART_BORDER_RADIUS,
  ALBUM_ART_DIMENSIONS,
  ALBUM_ART_SIZE,
  albumArtLinkSx,
} from './albumArtStyles';

type AlbumImageProps = {
  isPlaying: boolean;
  track: Track;
  /** Note color for visibility against the background. */
  noteColor?: string;
};

const cardSx: SxObject = {
  ...ALBUM_ART_BORDER_RADIUS,
  alignContent: 'center',
  aspectRatio: '1 / 1',
  margin: 0,
  minWidth: 'var(--image-dim)',
  overflow: 'hidden',
  padding: 0,
  position: 'relative',
  ...createBouncyTransition(['max-height', 'height']),
};

const wrapperSx: SxObject = {
  ...ALBUM_ART_DIMENSIONS,
  alignSelf: 'flex-end',
  aspectRatio: '1 / 1',
  minWidth: 'var(--image-dim)',
};

/**
 * Album image with notes and waveform bounce when playing.
 * Used for the main Spotify card display.
 */
export function AlbumImage({ track, isPlaying, noteColor }: AlbumImageProps) {
  const { album, albumImage } = track;
  const albumTitle = album.name;
  const albumUrl = album.externalUrls.spotify;

  return (
    <AlbumArtWithNotes isPlaying={isPlaying} noteColor={noteColor} wrapperSx={wrapperSx}>
      <Link href={albumUrl} isExternal={true} sx={albumArtLinkSx} title={albumTitle}>
        <Card sx={cardSx}>
          <Image
            alt={albumTitle}
            {...albumImage}
            fill={true}
            height={ALBUM_ART_SIZE}
            sizes={{ extraLarge: ALBUM_ART_SIZE }}
            width={ALBUM_ART_SIZE}
          />
        </Card>
      </Link>
    </AlbumArtWithNotes>
  );
}

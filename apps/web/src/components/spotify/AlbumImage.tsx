'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { Image } from '@dg/ui/dependent/Image';
import { Link } from '@dg/ui/dependent/Link';
import { createBouncyTransition } from '@dg/ui/helpers/bouncyTransition';
import type { SxObject } from '@dg/ui/theme';
import { Card } from '@mui/material';
import { AlbumArtWithNotes } from './AlbumArtWithNotes';

type AlbumImageProps = {
  isPlaying: boolean;
  noteColor?: string;
  track: Track;
};

/** Base album art size at md breakpoint */
export const ALBUM_IMAGE_SIZE = 150;

/** Responsive --image-dim CSS variable map for album art sizing */
export const ALBUM_ART_DIMENSIONS: SxObject = {
  '--image-dim': {
    md: `${ALBUM_IMAGE_SIZE}px`,
    sm: `${(4 * ALBUM_IMAGE_SIZE) / 5}px`,
    xs: `${(2 * ALBUM_IMAGE_SIZE) / 3}px`,
  },
};

/** Responsive border radius for album art */
export const ALBUM_ART_BORDER_RADIUS: SxObject = {
  borderRadius: { md: 6, sm: 4, xs: 2 },
};

const HOVER_SCALE = 1.05;

const linkSx: SxObject = {
  '&:hover': { transform: `scale(${HOVER_SCALE})` },
  ...createBouncyTransition('transform'),
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
 * Album image with notes and waveform bounce when playing. Shared frame with header.
 */
export function AlbumImage({ track, isPlaying, noteColor }: AlbumImageProps) {
  const { album, albumImage } = track;
  const albumTitle = album.name;
  const albumUrl = album.externalUrls.spotify;

  return (
    <AlbumArtWithNotes isPlaying={isPlaying} noteColor={noteColor} wrapperSx={wrapperSx}>
      <Link href={albumUrl} isExternal={true} sx={linkSx} title={albumTitle}>
        <Card sx={cardSx}>
          <Image
            alt={albumTitle}
            {...albumImage}
            fill={true}
            height={ALBUM_IMAGE_SIZE}
            sizes={{ extraLarge: ALBUM_IMAGE_SIZE }}
            width={ALBUM_IMAGE_SIZE}
          />
        </Card>
      </Link>
    </AlbumArtWithNotes>
  );
}

'use client';

import { Image } from '@dg/ui/dependent/Image';
import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import {
  ALBUM_TILE_ART_SIZE,
  ALBUM_TILE_ART_SIZES,
  albumCoverSx,
  albumSleeveScrimSx,
} from './albumTileGeometry';

type Props = {
  /** Album art URL, the same for every cover in a stack. */
  imageUrl: string;
  /** Empty for the sleeves behind the front cover, which are decorative. */
  alt: string;
  /** 0 is the front cover; deeper covers sit further back in the fan. */
  depth: number;
  /** Sleeves behind the front cover, which is what centres the fan. */
  sleeveCount: number;
  /** Pinned inside the cover and clipped by it, e.g. the play-count chip. */
  children?: ReactNode;
  /** Intrinsic art edge, defaults to the shared tile size. */
  artSize?: number;
  /** `next/image` sizes hint. Greenhouse stacks pass a 2× hint. */
  sizes?: {
    extraLarge: number;
    large?: number;
    medium?: number;
    small?: number;
    tiny?: number;
  };
};

/**
 * One album cover, the piece every music grid cell is built from. Covers
 * behind the front carry a scrim of page background so the fan recedes.
 */
export function AlbumCover({
  imageUrl,
  alt,
  depth,
  sleeveCount,
  children,
  artSize = ALBUM_TILE_ART_SIZE,
  sizes = ALBUM_TILE_ART_SIZES,
}: Props) {
  return (
    <Box aria-hidden={depth > 0 || undefined} sx={albumCoverSx(depth, sleeveCount)}>
      <Image alt={alt} fill={true} height={artSize} sizes={sizes} url={imageUrl} width={artSize} />
      {depth > 0 ? <Box sx={albumSleeveScrimSx(depth)} /> : null}
      {children}
    </Box>
  );
}

'use client';

import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import { AlbumCover } from './AlbumCover';
import { albumTileFrameSx } from './albumTileGeometry';

type Props = {
  /** Album art URL, repeated by every sleeve behind the front cover. */
  imageUrl: string;
  /** Sleeves fanned behind the front cover. Zero draws a lone cover. */
  sleeveCount: number;
  /** The front of the stack: a cover, or the socket left when art is away. */
  children: ReactNode;
  /** The sleeves share the front cover's request, and any of them can be the painted LCP. */
  isLcpCandidate?: boolean;
};

/**
 * The cell both music pages are built from: a square frame holding fanned
 * sleeves with `children` in front of them.
 *
 * The front is the caller's because the two pages want different things of it
 * — an external link's cover with a play-count chip, or a cover inside a view
 * transition that morphs into the album well. Sleeves never take a transition
 * name, so a morph lifts only the front cover and the fan stays where it is.
 */
export function AlbumStack({ imageUrl, sleeveCount, children, isLcpCandidate = false }: Props) {
  // Back to front, so the front cover paints last and sits on top.
  const sleeveDepths = Array.from({ length: sleeveCount }, (_, index) => sleeveCount - index);

  return (
    <Box sx={albumTileFrameSx}>
      {sleeveDepths.map((depth) => (
        <AlbumCover
          alt=""
          depth={depth}
          imageUrl={imageUrl}
          isLcpCandidate={isLcpCandidate}
          key={depth}
          sleeveCount={sleeveCount}
        />
      ))}
      {children}
    </Box>
  );
}

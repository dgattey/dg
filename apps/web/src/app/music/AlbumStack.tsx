'use client';

import { Tooltip } from '@dg/ui/core/Tooltip';
import { Image } from '@dg/ui/dependent/Image';
import { Link } from '@dg/ui/dependent/Link';
import { createBouncyTransition } from '@dg/ui/helpers/bouncyTransition';
import type { SxObject } from '@dg/ui/theme';
import { Box, Typography } from '@mui/material';
import { ALBUM_ART_HOVER_SCALE, ALBUM_ART_SIZE } from '../spotify/albumArtStyles';

/** Sleeves drawn per stack, including the front cover. */
const MAX_LAYERS = 3;

/** How far each sleeve shifts from its neighbour, as a percent of the cell. */
const LAYER_STEP = 4;

/** Slack left in the cell so rotated corners never cross into the grid gap. */
const LAYER_INSET = 2;

/** Degrees of fan added per sleeve sitting behind the front cover. */
const LAYER_TILT = 1.5;

/** How much wider the fan spreads while hovered or focused. */
const HOVER_SPREAD = 1.5;

/** Percent of the page background mixed into each sleeve behind the front. */
const LAYER_RECESSION = 22;

const linkSx: SxObject = {
  '--album-stack-spread': 1,
  '&:focus-visible, &:hover': {
    '--album-stack-spread': HOVER_SPREAD,
    transform: `scale(${ALBUM_ART_HOVER_SCALE})`,
    zIndex: 1,
  },
  display: 'block',
  maxWidth: ALBUM_ART_SIZE,
  position: 'relative',
  width: '100%',
  ...createBouncyTransition('transform'),
};

const stackSx: SxObject = {
  aspectRatio: '1 / 1',
  position: 'relative',
  width: '100%',
};

const countChipSx: SxObject = {
  backdropFilter: 'blur(12px) saturate(150%)',
  backgroundColor: 'color-mix(in srgb, var(--mui-palette-background-default) 70%, transparent)',
  border: 'thin solid var(--mui-palette-card-border)',
  borderRadius: 999,
  bottom: 8,
  color: 'var(--mui-palette-text-primary)',
  insetInlineStart: 8,
  lineHeight: 1.4,
  paddingInline: 0.75,
  position: 'absolute',
  whiteSpace: 'nowrap',
};

/**
 * Sleeves share the front cover's radius and shadow so a stack reads as the
 * same object as a single tile, just repeated. Depth is carried by the offset,
 * the fan, and a scrim that mixes the page background into the sleeves behind.
 */
function layerSx(depth: number, layerCount: number): SxObject {
  const shift = (depth - (layerCount - 1) / 2) * LAYER_STEP;
  const scale = (100 - (layerCount - 1) * LAYER_STEP - LAYER_INSET) / 100;
  const spread = 'var(--album-stack-spread)';

  return {
    borderRadius: 2,
    boxShadow: 'var(--mui-extraShadows-card-main)',
    inset: 0,
    lineHeight: 0,
    overflow: 'hidden',
    position: 'absolute',
    transform: `translate(calc(${shift}% * ${spread}), calc(${-shift}% * ${spread})) rotate(${depth * LAYER_TILT}deg) scale(${scale})`,
    ...(depth > 0 ? { border: 'thin solid var(--mui-palette-card-border)' } : {}),
    ...createBouncyTransition('transform'),
  };
}

const scrimSx = (depth: number): SxObject => ({
  backgroundColor: `color-mix(in srgb, var(--mui-palette-background-default) ${depth * LAYER_RECESSION}%, transparent)`,
  inset: 0,
  position: 'absolute',
});

type Props = {
  /** Album art URL, shared by every sleeve in the stack. */
  imageUrl: string;
  albumName: string;
  artistNames: string;
  /** Where the whole stack navigates — the album, not any one track. */
  linkUrl: string;
  /** Number of plays collapsed into this stack. */
  trackCount: number;
};

/**
 * A run of consecutive plays from one album, drawn as a stack of sleeves.
 *
 * The front cover is styled exactly like a single-track tile, with up to two
 * more sleeves fanned behind it so a full album listen reads as one object
 * instead of a dozen identical squares.
 */
export function AlbumStack({ imageUrl, albumName, artistNames, linkUrl, trackCount }: Props) {
  const layerCount = Math.min(trackCount, MAX_LAYERS);
  const countLabel = `${trackCount} ${trackCount === 1 ? 'track' : 'tracks'}`;
  const label = `${albumName} – ${artistNames}, ${countLabel}`;

  // Back to front, so the front cover paints last and sits on top.
  const depths = Array.from({ length: layerCount }, (_, index) => layerCount - 1 - index);

  return (
    <Tooltip title={label}>
      <Link href={linkUrl} isExternal={true} sx={linkSx} title={label}>
        <Box sx={stackSx}>
          {depths.map((depth) => (
            <Box aria-hidden={depth > 0 || undefined} key={depth} sx={layerSx(depth, layerCount)}>
              <Image
                alt={depth === 0 ? albumName : ''}
                fill={true}
                height={ALBUM_ART_SIZE}
                sizes={{ extraLarge: ALBUM_ART_SIZE }}
                url={imageUrl}
                width={ALBUM_ART_SIZE}
              />
              {depth > 0 ? <Box sx={scrimSx(depth)} /> : null}
            </Box>
          ))}
          <Typography component="span" sx={countChipSx} variant="caption">
            {countLabel}
          </Typography>
        </Box>
      </Link>
    </Tooltip>
  );
}

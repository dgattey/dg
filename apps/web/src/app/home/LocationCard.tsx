import type { MapLocation } from '@dg/content-models/contentful/MapLocation';
import { MapCard } from '@dg/maps/MapCard';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import type { SxObject } from '@dg/ui/theme';
import { Box, Typography } from '@mui/material';

const paperMix = (percent: number) =>
  `color-mix(in srgb, var(--mui-palette-background-paper) ${percent}%, transparent)`;

const cardSx: SxObject = {
  '[data-greenhouse-frame] &[data-bento="location"]': {
    aspectRatio: { md: '4 / 3', xs: '1 / 1' },
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    gridTemplateRows: 'minmax(0, 1fr)',
    height: 'auto !important',
    maxWidth: 'none',
    minHeight: { sm: '16rem', xs: '14rem' },
    overflow: 'hidden',
    padding: 0,
    width: '100%',
  },
};

const wellSx: SxObject = {
  '& .MuiCard-root': {
    aspectRatio: 'unset',
    backdropFilter: 'none',
    background: 'transparent',
    border: 0,
    borderRadius: 0,
    boxShadow: 'none',
    height: '100%',
    maxWidth: 'none',
    minHeight: '100%',
    padding: 0,
    width: '100%',
  },
  '& *:has(> [aria-label="Zoom in"])': {
    bottom: 12,
    left: 'auto',
    right: 12,
    top: 'auto',
  },
  '& *:has(> img[alt="Location marker"])': {
    height: '100%',
    inset: 0,
    left: 0,
    top: 0,
    width: '100%',
  },
  '& img[alt="Location marker"]': {
    borderRadius: '50%',
    height: '100%',
    left: 0,
    maxWidth: 'none',
    objectFit: 'cover',
    position: 'absolute',
    top: 0,
    width: '100%',
  },
  gridArea: '1 / 1',
  height: '100%',
  minHeight: 0,
  overflow: 'hidden',
  position: 'relative',
  width: '100%',
};

const eyebrowSx: SxObject = {
  background: paperMix(78),
  borderRadius: 1,
  gridArea: '1 / 1',
  justifySelf: 'start',
  margin: 1.5,
  paddingBlock: 0.25,
  paddingInline: 0.75,
  zIndex: 2,
};

/**
 * Greenhouse location tile. The map fills the glass card edge-to-edge;
 * the Location eyebrow sits on the field and zoom docks bottom-right.
 */
export function LocationCard({ location }: { location: MapLocation | null | undefined }) {
  return (
    <ContentCard data-bento="location" sx={cardSx}>
      <Box data-location-map="" sx={wellSx}>
        <MapCard location={location} />
      </Box>
      <Typography component="h2" sx={eyebrowSx} variant="overline">
        Location
      </Typography>
    </ContentCard>
  );
}

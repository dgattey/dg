import type { MapLocation } from '@dg/content-models/contentful/MapLocation';
import { MapCard } from '@dg/maps/MapCard';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import type { SxObject } from '@dg/ui/theme';
import { Box, Typography } from '@mui/material';

const cardSx: SxObject = {
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: 1.25,
  height: '100%',
  justifySelf: 'stretch',
  maxWidth: 'none',
  minHeight: { sm: '13.5rem', xs: 'auto' },
  minWidth: 0,
  padding: 2.25,
  width: '100%',
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
    width: '100%',
  },
  borderRadius: 2,
  flex: '1 1 auto',
  minHeight: { md: '12rem', xs: '10rem' },
  overflow: 'hidden',
  position: 'relative',
  width: '100%',
};

/**
 * Greenhouse location tile. Glass chrome and the Location eyebrow live here so
 * flag-off `MapCard` stays an edge-to-edge map. The map provider is unchanged.
 */
export function LocationCard({ location }: { location: MapLocation | null | undefined }) {
  return (
    <ContentCard sx={cardSx}>
      <Typography component="h2" variant="overline">
        Location
      </Typography>
      <Box data-location-map="" sx={wellSx}>
        <MapCard location={location} />
      </Box>
    </ContentCard>
  );
}

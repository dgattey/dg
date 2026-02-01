'use client';

import type { MapLocation } from '@dg/content-models/contentful/MapLocation';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import type { SxObject } from '@dg/ui/theme';
import { themePreferenceAttribute, themeSelectorAttribute } from '@dg/ui/theme';
import { lazy, Suspense, useState } from 'react';

const FullMapCard = lazy(() => import('./mapbox/FullMapCard'));

const previewCardBaseSx: SxObject = {
  border: 'none',
};

const getPreviewCardSx = (backgroundImageVars: SxObject | null): SxObject => ({
  ...previewCardBaseSx,
  ...(backgroundImageVars && {
    ...backgroundImageVars,
    backgroundImage: 'var(--map-preview-light)',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    [`html[${themeSelectorAttribute}="dark"] &`]: {
      backgroundImage: 'var(--map-preview-dark)',
    },
    '@media (prefers-color-scheme: dark)': {
      [`html[${themePreferenceAttribute}="system"]:not([${themeSelectorAttribute}]) &`]: {
        backgroundImage: 'var(--map-preview-dark)',
      },
    },
  }),
});

/**
 * Shows a lazy loaded map card, to be fetched on mouse over/touch start.
 * The FullMapCard is lazy loaded here to keep it client-only.
 */
export function LazyLoadedMap({ location }: { location: MapLocation | null | undefined }) {
  const [showFullMapComponent, setShowFullMapComponent] = useState(false);
  const loadFullMap = () => {
    setShowFullMapComponent(true);
  };

  return showFullMapComponent && location ? (
    <Suspense fallback={<PreviewCard key="map-card" location={location} />}>
      <PreviewCard key="map-card" location={location}>
        <FullMapCard location={location} />
      </PreviewCard>
    </Suspense>
  ) : (
    <PreviewCard key="map-card" loadFullMap={loadFullMap} location={location} />
  );
}

/**
 * Takes care of background image and hover effects for the preview card
 */
function PreviewCard({
  children,
  loadFullMap,
  location,
}: {
  children?: React.ReactNode;
  loadFullMap?: () => void;
  location: MapLocation | null | undefined;
}) {
  const lightImage = location?.backupImageUrls.light ?? null;
  const darkImage = location?.backupImageUrls.dark ?? null;
  const fallbackLightImage = lightImage ?? darkImage;
  const fallbackDarkImage = darkImage ?? lightImage;
  const hasBackgroundImage = Boolean(fallbackLightImage);

  const backgroundImageVars: SxObject | null = hasBackgroundImage
    ? {
        '--map-preview-dark': `url("${fallbackDarkImage}")`,
        '--map-preview-light': `url("${fallbackLightImage}")`,
      }
    : null;
  return (
    <ContentCard
      onMouseOver={() => loadFullMap?.()}
      onTouchStart={() => loadFullMap?.()}
      sx={getPreviewCardSx(backgroundImageVars)}
    >
      {children}
    </ContentCard>
  );
}

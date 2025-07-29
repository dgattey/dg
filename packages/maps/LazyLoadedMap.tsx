import type { MapLocation } from 'api/contentful/MapLocation';
import type { JSXElementConstructor } from 'react';
import { Suspense, useState } from 'react';
import { ContentCard } from 'ui/dependent/ContentCard';
import { useColorScheme } from 'ui/theme/useColorScheme';

/**
 * Shows a lazy loaded map card, to be fetched on mouse over/touch start.
 * The FullMapCard must be lazy loaded and passed in here!
 */
export function LazyLoadedMap({
  FullMapCard,
  location,
}: {
  FullMapCard: JSXElementConstructor<{ location: MapLocation }>;
  location: MapLocation | null | undefined;
}) {
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
  const { colorScheme } = useColorScheme();
  const backgroundImageUrl = colorScheme.isInitialized
    ? ((colorScheme.mode === 'light'
        ? location?.backupImageUrls.light
        : location?.backupImageUrls.dark) ?? null)
    : null;
  return (
    <ContentCard
      onMouseOver={() => loadFullMap?.()}
      onTouchStart={() => loadFullMap?.()}
      sx={(theme) => ({
        border: 'none',
        minHeight: 297,
        [theme.breakpoints.down('md')]: {
          height: 200,
          minHeight: 200,
          width: '100%',
        },
        ...(backgroundImageUrl && {
          backgroundImage: `url('${backgroundImageUrl}')`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }),
      })}
    >
      {children}
    </ContentCard>
  );
}

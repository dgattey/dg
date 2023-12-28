import { Suspense, useState } from 'react';
import dynamic from 'next/dynamic';
import { useColorScheme } from 'ui/theme/useColorScheme';
import { useData } from 'api/useData';
import type { ContentCardProps } from 'components/ContentCard';
import { MapContentCard } from 'components/maps/MapContentCard';

type MapPreviewCardProps = Pick<ContentCardProps, 'turnOnAnimation'>;

// Only render when you want to start importing this giant component
const FullMapCard = dynamic(() => import('components/maps/FullMapCard'), {
  suspense: true,
});

/**
 * Shows a preview of the full map card, to be fetched on hover.
 */
export function MapPreviewCard({ turnOnAnimation }: MapPreviewCardProps) {
  const { data: location } = useData('location');
  const { colorScheme } = useColorScheme();
  const [showFullMapComponent, setShowFullMapComponent] = useState(false);

  const backgroundImageUrl = colorScheme.isInitialized
    ? (colorScheme.mode === 'light'
        ? location?.backupImageUrls.light
        : location?.backupImageUrls.dark) ?? null
    : null;

  // Loads the full map card on hover
  const previewCard = (
    <MapContentCard
      backgroundImageUrl={backgroundImageUrl}
      onMouseOver={() => {
        setShowFullMapComponent(true);
      }}
      onTouchStart={() => {
        setShowFullMapComponent(true);
      }}
      turnOnAnimation={turnOnAnimation}
    />
  );

  return showFullMapComponent && location ? (
    <Suspense fallback={previewCard}>
      <FullMapCard
        backgroundImageUrl={backgroundImageUrl}
        location={location}
        turnOnAnimation={turnOnAnimation}
      />
    </Suspense>
  ) : (
    previewCard
  );
}
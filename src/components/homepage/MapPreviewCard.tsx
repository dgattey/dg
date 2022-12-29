import { useData } from 'api/useData';
import type { ContentCardProps } from 'components/ContentCard';
import { Suspense, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapContentCard } from 'components/maps/MapContentCard';
import { useColorScheme } from 'hooks/useColorScheme';

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
      turnOnAnimation={turnOnAnimation}
      onMouseOver={() => setShowFullMapComponent(true)}
      onTouchStart={() => setShowFullMapComponent(true)}
    />
  );

  return showFullMapComponent && location ? (
    <Suspense fallback={previewCard}>
      <FullMapCard
        turnOnAnimation={turnOnAnimation}
        location={location}
        backgroundImageUrl={backgroundImageUrl}
      />
    </Suspense>
  ) : (
    previewCard
  );
}

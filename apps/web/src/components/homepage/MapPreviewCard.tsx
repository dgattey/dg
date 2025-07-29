import { useData } from 'api/useData';
import { LazyLoadedMap } from 'maps/LazyLoadedMap';
import dynamic from 'next/dynamic';

// Only render when you want to start importing this giant component
const FullMapCard = dynamic(() => import('maps/mapbox/FullMapCard'), {
  loading: () => null,
});

/**
 * Shows a preview of the full map card, to be fetched on hover.
 */
export function MapPreviewCard() {
  const { data: location } = useData('location');
  return <LazyLoadedMap FullMapCard={FullMapCard} location={location} />;
}

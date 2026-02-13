'use client';

import type { MapLocation } from '@dg/content-models/contentful/MapLocation';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import type { SxObject } from '@dg/ui/theme';
import { useEffect, useRef, useState } from 'react';
import { PigeonMap } from './src/PigeonMap';

const mapCardSx: SxObject = {
  border: 'none',
};

/**
 * Shows a map card using Pigeon Maps.
 * Defers tile loading until the card is visible in viewport
 * to reduce initial page bandwidth.
 */
export function MapCard({ location }: { location: MapLocation | null | undefined }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || !location) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [location]);

  return (
    <div ref={containerRef}>
      <ContentCard sx={mapCardSx}>
        {isVisible && location ? <PigeonMap location={location} /> : null}
      </ContentCard>
    </div>
  );
}

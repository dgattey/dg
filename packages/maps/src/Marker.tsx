import type { MapLocation } from '@dg/content-models/contentful/MapLocation';
import { Image } from '@dg/ui/dependent/Image';

const IMAGE_DIMENSION = 85;

type MarkerProps = {
  image?: MapLocation['image'];
};

/**
 * Custom map marker with optional image overlay.
 */
export function Marker({ image }: MarkerProps) {
  return (
    <div data-map-marker="">
      {image ? (
        <span data-map-marker-image="">
          <Image
            alt="Location marker"
            height={IMAGE_DIMENSION}
            sizes={{ extraLarge: IMAGE_DIMENSION }}
            url={image.url}
            width={IMAGE_DIMENSION}
          />
        </span>
      ) : null}
    </div>
  );
}

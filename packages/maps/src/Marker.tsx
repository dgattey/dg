import type { MapLocation } from '@dg/content-models/contentful/MapLocation';
import { Box } from '@dg/ui/core/Box';
import { Image } from '@dg/ui/dependent/Image';
import { createTransition, EASING_BOUNCY } from '@dg/ui/helpers/timing';
import type { SxObject } from '@dg/ui/theme';

const DIMENSION = 100;
const IMAGE_DIMENSION = 85;

const GLASS_SHADOW = `
  inset 0 1px 0 color-mix(in srgb, var(--mui-palette-common-white) 15%, transparent),
  0px 1px 5px color-mix(in srgb, var(--mui-palette-common-black) 12%, transparent),
  0px 6px 16px color-mix(in srgb, var(--mui-palette-common-black) 8%, transparent)`;

const containerSx: SxObject = {
  backdropFilter: 'blur(12px) saturate(150%)',
  backgroundColor: 'color-mix(in srgb, var(--mui-palette-background-default) 70%, transparent)',
  border: '2px solid color-mix(in srgb, var(--mui-palette-background-default) 60%, transparent)',
  borderRadius: '50%',
  boxShadow: GLASS_SHADOW,
  cursor: 'grab',
  height: DIMENSION,
  opacity: 0.85,
  overflow: 'hidden',
  position: 'relative',
  transform: 'translate(-50%, -50%)',
  transition: createTransition(
    ['background-color', 'border-color', 'box-shadow'],
    375,
    EASING_BOUNCY,
  ),
  width: DIMENSION,
};

const imageSx: SxObject = {
  left: `${(DIMENSION - IMAGE_DIMENSION) / 2}px`,
  position: 'absolute',
  top: `${(DIMENSION - IMAGE_DIMENSION) / 2}px`,
};

type MarkerProps = {
  image?: MapLocation['image'];
};

/**
 * Custom map marker with optional image overlay.
 */
export function Marker({ image }: MarkerProps) {
  return (
    <Box sx={containerSx}>
      {image ? (
        <Box component="span" sx={imageSx}>
          <Image
            alt="Location marker"
            height={IMAGE_DIMENSION}
            sizes={{ extraLarge: IMAGE_DIMENSION }}
            url={image.url}
            width={IMAGE_DIMENSION}
          />
        </Box>
      ) : null}
    </Box>
  );
}

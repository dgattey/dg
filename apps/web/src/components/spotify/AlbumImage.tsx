import type { Track } from '@dg/content-models/spotify/Track';
import { createBouncyTransition } from '@dg/ui/helpers/bouncyTransition';
import type { SxObject } from '@dg/ui/theme';
import { ArtworkLink } from './ArtworkLink';

type AlbumImageProps = {
  track: Track;
};

// In px, how big our rendered image is. Next resizes the API image to this constant size.
const IMAGE_SIZE = 150;

const cardSx: SxObject = {
  '--image-dim': {
    md: `${IMAGE_SIZE}px`,
    sm: `${(2 * IMAGE_SIZE) / 3}px`,
    xs: `${IMAGE_SIZE / 2}px`,
  },
  alignContent: 'center',
  alignSelf: 'flex-end',
  aspectRatio: '1 / 1',
  borderRadius: { md: 6, sm: 4, xs: 2 },
  margin: 0,
  minWidth: 'var(--image-dim)',
  overflow: 'hidden',
  padding: 0,
  position: 'relative',
  ...createBouncyTransition(['max-height', 'height']),
};

/**
 * Creates an album image that links to the album directly
 */
export function AlbumImage({ track }: AlbumImageProps) {
  const { album, albumImage } = track;
  const albumTitle = album.name;
  const albumUrl = album.externalUrls.spotify;

  return (
    <ArtworkLink
      cardSx={cardSx}
      hoverScale={1.05}
      href={albumUrl}
      image={albumImage}
      imageSize={IMAGE_SIZE}
      sizes={{ extraLarge: IMAGE_SIZE }}
      title={albumTitle}
    />
  );
}

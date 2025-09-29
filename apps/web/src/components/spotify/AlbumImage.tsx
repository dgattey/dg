import { Card } from '@mui/material';
import type { Track } from 'api/spotify/Track';
import { Image } from 'ui/dependent/Image';
import { Link } from 'ui/dependent/Link';
import { bouncyTransition } from 'ui/helpers/bouncyTransition';
import { useLinkWithName } from '../../hooks/useLinkWithName';

type AlbumImageProps = {
  album: Track['album'];
};

// In px, the max image size we want from the API. We should have this be as big as it supports, as Next can resize down.
const API_IMAGE_SIZE = 640;

// In px, how big our rendered image is. Next resizes the API image to this constant size.
const IMAGE_SIZE = 150;

/**
 * Creates an album image that links to the album directly
 */
export function AlbumImage({ album }: AlbumImageProps) {
  const albumLink = useLinkWithName('Spotify', {
    title: album.name,
    url: album.external_urls.spotify,
  });
  const albumImage = album.images.find((image) => image?.width === API_IMAGE_SIZE);
  if (!albumLink || !albumImage) {
    return null;
  }

  return (
    <Link
      isExternal={true}
      {...albumLink}
      href={albumLink.url}
      sx={(theme) => ({
        '&:hover': {
          transform: 'scale(1.05)',
        },
        ...bouncyTransition(theme, ['transform']),
      })}
    >
      <Card
        sx={(theme) => ({
          '--image-dim': `${IMAGE_SIZE}px`,
          alignContent: 'center',
          alignSelf: 'flex-end',
          aspectRatio: '1 / 1',
          borderRadius: 6,
          margin: 0,
          minWidth: `var(--image-dim)`,
          overflow: 'hidden',
          padding: 0,
          position: 'relative',
          ...bouncyTransition(theme, ['max-height', 'height']),
          [theme.breakpoints.down('md')]: {
            '--image-dim': `${(2 * IMAGE_SIZE) / 3}px`,
            borderRadius: 4,
          },
          [theme.breakpoints.down('sm')]: {
            '--image-dim': `${IMAGE_SIZE / 2}px`,
            borderRadius: 2,
          },
        })}
      >
        <Image
          alt={album.name}
          {...albumImage}
          fill={true}
          height={IMAGE_SIZE}
          sizes={{ extraLarge: IMAGE_SIZE }}
          width={IMAGE_SIZE}
        />
      </Card>
    </Link>
  );
}

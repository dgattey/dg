import type { Track } from 'api/types/spotify/Track';
import { Image } from 'components/Image';
import { Link } from 'components/Link';
import { useLinkWithName } from 'hooks/useLinkWithName';
import { Card } from '@mui/material';

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
      isExternal
      {...albumLink}
      href={albumLink.url}
      sx={{
        transition: (theme) => theme.transitions.create(['transform']),
        '&:hover': {
          transform: 'scale(1.05)',
        },
      }}
    >
      <Card
        sx={(theme) => ({
          position: 'relative',
          alignSelf: 'flex-end',
          borderRadius: 8,
          margin: 0,
          padding: 0,
          overflow: 'hidden',
          aspectRatio: '1 / 1',
          height: '100%',
          maxHeight: `${IMAGE_SIZE}px`,
          transition: theme.transitions.create(['max-height', 'height']),
          [theme.breakpoints.down('md')]: {
            maxHeight: `${(2 * IMAGE_SIZE) / 3}px`,
            borderRadius: 6,
          },
          [theme.breakpoints.down('sm')]: {
            maxHeight: `${IMAGE_SIZE / 2}px`,
            borderRadius: 4,
          },
        })}
      >
        <Image
          alt={album.name}
          {...albumImage}
          width={IMAGE_SIZE}
          height={IMAGE_SIZE}
          sizes={{ extraLarge: IMAGE_SIZE }}
        />
      </Card>
    </Link>
  );
}

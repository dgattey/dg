import type { Track } from 'api/types/spotify/Track';
import { Image } from 'components/Image';
import { Link } from 'components/Link';
import { useLinkWithName } from 'hooks/useLinkWithName';
import styled from '@emotion/styled';

type Props = Track;

// In px, the max image size we want from the API. We should have this be as big as it supports, as Next can resize down.
const API_IMAGE_SIZE = 640;

// In px, how big our rendered image is. Next resizes the API image to this constant size.
const IMAGE_SIZE = 150;

// Slightly un-rounds the corners + makes sure it's the right size
const ImageContainer = styled.article`
  --border-radius: 1.5rem;
  margin: 0;
  padding: 0;
  overflow: hidden;
`;

// Flexes as much as our max image size, and maintains an aspect ratio from height
const FlexedLink = styled(Link)`
  justify-self: flex-end;
  aspect-ratio: 1 / 1;
  height: 100%;
  max-height: ${IMAGE_SIZE}px;
  transition: max-height var(--transition), height var(--transition);
`;

/**
 * Creates an album image that links to the album directly
 */
export function AlbumImage({ name, album }: Props) {
  const albumLink = useLinkWithName('Spotify', {
    title: album.name,
    url: album.external_urls.spotify,
  });
  const albumImage = album.images.find((image) => image?.width === API_IMAGE_SIZE);
  const imageComponent = albumImage ? (
    <ImageContainer>
      <Image
        alt={name}
        {...albumImage}
        width={IMAGE_SIZE}
        height={IMAGE_SIZE}
        sizes={{ extraLarge: 150 }}
      />
    </ImageContainer>
  ) : null;

  return albumLink ? (
    <FlexedLink isExternal {...albumLink}>
      {imageComponent}
    </FlexedLink>
  ) : (
    imageComponent
  );
}

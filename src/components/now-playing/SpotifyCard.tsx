import { findLinkWithName } from 'api/parsers';
import useData from 'api/useData';
import ContentCard from 'components/ContentCard';
import Image from 'components/Image';
import Link from 'components/Link';
import Stack from 'components/Stack';
import useRelativeTimeFormat from 'hooks/useRelativeTimeFormat';
import React from 'react';
import { FaSpotify } from 'react-icons/fa';
import { FiMusic } from 'react-icons/fi';
import styled, { css } from 'styled-components';

const IMAGE_SIZE = 140;

const truncated = (numberOfLines: number) => css`
  /* stylelint-disable-next-line */
  display: -webkit-box;
  -webkit-line-clamp: ${numberOfLines};
  -webkit-box-orient: vertical;
  overflow: hidden;
`;
const Container = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
  pointer-events: none;
`;

const BackgroundLink = styled(Link)`
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  z-index: -1;
  pointer-events: auto;
`;

const Content = styled(Stack).attrs({ $isVertical: true, $justifyContent: 'space-between' })`
  padding: var(--spacing);
  height: 100%;
  z-index: 1;
  pointer-events: none;
`;

const ImageContainer = styled.article`
  --border-radius: 1.5rem;
  margin: 0;
  padding: 0;
  height: ${IMAGE_SIZE}px;
  width: ${IMAGE_SIZE}px;
  pointer-events: auto;
`;

const BigLogoLink = styled(Link)`
  line-height: 1;
  font-size: 3rem;
  margin: 0;
  pointer-events: auto;
`;

const Status = styled.h6`
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  font-size: 0.65rem;
  pointer-events: auto;
`;

const TextGroup = styled.hgroup`
  margin-bottom: 0.5rem;
  pointer-events: none;
`;

const SongTitle = styled.h5`
  margin-bottom: 0.25rem;
  ${truncated(2)}
  pointer-events: auto;
`;

const ArtistName = styled.h6`
  ${truncated(1)}
  pointer-events: auto;
`;

const PlainLink = styled(Link)`
  color: inherit;
`;

/**
 * Shows a card with the latest data from Spotify
 */
const SpotifyCard = () => {
  const { data: spotifyPlayed } = useData('current/playing');
  const { data: footerLinks } = useData('footer');
  const song = (() => {
    if (!spotifyPlayed) {
      return null;
    }
    switch (spotifyPlayed.dataType) {
      case 'current':
        return spotifyPlayed.item;
      case 'recent':
        return spotifyPlayed.items?.[0]?.track;
    }
  })();

  const lastPlayed =
    spotifyPlayed?.dataType === 'recent' ? spotifyPlayed.items?.[0]?.played_at : null;
  const relativeLastPlayed = useRelativeTimeFormat(lastPlayed);

  // Copy the icon from the footer links, but create a link that links to the song
  const spotifyIconLink = findLinkWithName(footerLinks, 'Spotify');
  const linkToSong =
    song && spotifyIconLink
      ? { ...spotifyIconLink, title: song.name, url: song.external_urls.spotify }
      : spotifyIconLink;
  const linkToArtist = (artistUrl: string | undefined) =>
    song && spotifyIconLink
      ? { ...spotifyIconLink, title: song.name, url: artistUrl }
      : spotifyIconLink;
  const linkToAlbum =
    song && spotifyIconLink
      ? { ...spotifyIconLink, title: song.name, url: song.album.external_urls.spotify }
      : spotifyIconLink;

  const albumImage = song?.album?.images.find((image) => image?.width === 300);
  const contents = song ? (
    <>
      <Status>
        <Stack $alignItems="center" $gap="4px">
          {lastPlayed ? (
            `Played ${relativeLastPlayed}`
          ) : (
            <>
              Now Playing
              <FiMusic />
            </>
          )}
        </Stack>
      </Status>
      <TextGroup>
        <SongTitle>
          {linkToSong ? <PlainLink {...linkToSong}>{song.name}</PlainLink> : song.name}
        </SongTitle>
        <ArtistName>
          {song.artists?.map((artist, index, allArtists) => {
            const joinText = (() => {
              const isLast = index === allArtists.length - 1;
              if (isLast) {
                return null;
              }
              if (allArtists.length === 2) {
                return ' & ';
              }
              return index < allArtists.length - 2 ? ', ' : ', & ';
            })();
            const artistLink = linkToArtist(artist.external_urls.spotify);
            return (
              <React.Fragment key={artist.id}>
                {artistLink ? <PlainLink {...artistLink}>{artist.name}</PlainLink> : artist.name}
                <span>{joinText}</span>
              </React.Fragment>
            );
          })}
        </ArtistName>
      </TextGroup>
    </>
  ) : (
    <Status>Nothing playing</Status>
  );

  return (
    <ContentCard>
      <Container>
        {linkToSong && <BackgroundLink layout="empty" {...linkToSong} />}
        <Content>
          <Stack $justifyContent="space-between">
            {linkToSong && (
              <BigLogoLink {...linkToSong}>
                <FaSpotify />
              </BigLogoLink>
            )}
            {albumImage && linkToAlbum && (
              <Link {...linkToAlbum}>
                <ImageContainer>
                  <Image
                    alt={song?.name}
                    {...albumImage}
                    width={IMAGE_SIZE}
                    height={IMAGE_SIZE}
                    layout="fixed"
                  />
                </ImageContainer>
              </Link>
            )}
          </Stack>
          <div>{contents}</div>
        </Content>
      </Container>
    </ContentCard>
  );
};

export default SpotifyCard;

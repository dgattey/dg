import { findLinkWithName } from 'api/parsers';
import useData from 'api/useData';
import ContentCard from 'components/ContentCard';
import Image from 'components/Image';
import Link from 'components/Link';
import Stack from 'components/Stack';
import TimeAgo from 'javascript-time-ago';
import enLocale from 'javascript-time-ago/locale/en.json';
import React from 'react';
import { FiMusic } from 'react-icons/fi';
import styled, { css } from 'styled-components';

TimeAgo.addDefaultLocale(enLocale);
const timeAgo = new TimeAgo('en-US');

const IMAGE_SIZE = 140;

const truncated = (numberOfLines: number) => css`
  display: box;
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

const BackgroundLink = styled.a`
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

const PlainLink = styled.a`
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

  // Copy the icon from the footer links, but create a link that links to the song
  const spotifyIconLink = findLinkWithName(footerLinks, 'Spotify');
  const linkToSong =
    song && spotifyIconLink
      ? { ...spotifyIconLink, title: song.name, url: song.external_urls.spotify }
      : spotifyIconLink;

  const albumImage = song?.album?.images.find((image) => image?.width === 300);
  const contents = song ? (
    <>
      <Status>
        <Stack $alignItems="center" $gap="4px">
          {lastPlayed ? (
            `Played ${timeAgo.format(Date.parse(lastPlayed))}`
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
          <PlainLink href={song.external_urls.spotify}>{song.name}</PlainLink>
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
            return (
              <React.Fragment key={artist.id}>
                <PlainLink href={artist.external_urls.spotify}>{artist.name}</PlainLink>
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
        {linkToSong && <BackgroundLink href={linkToSong.url} />}
        <Content>
          <Stack $justifyContent="space-between">
            {spotifyIconLink && <BigLogoLink {...spotifyIconLink} hideTooltip />}
            {albumImage && (
              <ImageContainer>
                <a href={song?.album.external_urls.spotify}>
                  <Image
                    alt={song?.name}
                    {...albumImage}
                    width={IMAGE_SIZE}
                    height={IMAGE_SIZE}
                    layout="fixed"
                  />
                </a>
              </ImageContainer>
            )}
          </Stack>
          <div>{contents}</div>
        </Content>
      </Container>
    </ContentCard>
  );
};

export default SpotifyCard;

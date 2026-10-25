import type { ListeningStats } from '@dg/services/spotify/fetchListeningStats';
import { formatCount } from '@dg/shared-core/formatting/formattedDistance';
import { Tooltip } from '@dg/ui/core/Tooltip';
import { Image } from '@dg/ui/dependent/Image';
import type { CSSProperties } from 'react';
import { PaperCard } from '../../collage/PaperCard';
import { cx } from '../../collage/paperVars';
import { formatHours, formatPercent, formatRangeSuffix } from './listeningStatsFormat';
import { bar, CardHead } from './StatsCardParts';
import { AlbumLink, ArtistLinks, SpotifyAnchor } from './StatsLinks';

const SONG_ART_TILTS = [-2.5, 2.2, -1.8, 2.6, -2.1, 1.9] as const;

export function TopSongsCard({ stats }: { stats: ListeningStats }) {
  const tracks = stats.topTracks.slice(0, 6);
  if (tracks.length === 0) {
    return null;
  }
  const top = tracks[0]?.plays ?? 1;
  const suffix = formatRangeSuffix(stats.range);
  return (
    <PaperCard
      className="stats__card stats__topSongs"
      edge="quad-b"
      innerClassName="stats__pad"
      tiltDeg={-0.9}
      tone="ochre"
    >
      <CardHead
        aside={`${formatCount(stats.tracks)} tracks played`}
        title={`Top songs, ${suffix}`}
      />
      <ol className="stats__topList">
        {tracks.map((track, i) => (
          <li className={cx('stats__topSongRow', i === 0 && 'stats__topRow--lead')} key={track.id}>
            <span className="stats__rankBadge">{String(i + 1).padStart(2, '0')}</span>
            <AlbumLink album={track.album} label={track.album.name}>
              <span
                className="stats__mat stats__songMat"
                style={
                  {
                    '--r': `${SONG_ART_TILTS[i % SONG_ART_TILTS.length] ?? 0}deg`,
                  } as CSSProperties
                }
              >
                <Image
                  alt={`${track.album.name} cover`}
                  height={44}
                  sizes={{ extraLarge: 44 }}
                  url={track.album.imageUrl}
                  width={44}
                />
              </span>
            </AlbumLink>
            <span className="stats__repeatName">
              <Tooltip title={track.name} whenTruncated>
                <SpotifyAnchor className="stats__label" href={track.url}>
                  {track.name}
                </SpotifyAnchor>
              </Tooltip>
              <ArtistLinks artists={track.artists} newArtists={stats.newArtists} />
            </span>
            <span aria-hidden="true" className="stats__meter" style={bar(track.plays, top)} />
            <span className="stats__topCountGroup">
              <span className="stats__count">{formatCount(track.plays)}</span>
              <span className="stats__meta">
                {formatHours((track.plays * stats.minutesPerPlay) / 60)}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </PaperCard>
  );
}

export function TopArtistsCard({ stats }: { stats: ListeningStats }) {
  const artists = stats.topArtists.slice(0, 6);
  if (artists.length === 0) {
    return null;
  }
  const top = artists[0]?.plays ?? 1;
  const suffix = formatRangeSuffix(stats.range);
  return (
    <PaperCard
      className="stats__card stats__topArtists"
      edge="soft-b"
      innerClassName="stats__pad"
      tiltDeg={1.1}
      tone="cobalt"
    >
      <CardHead
        aside={`${formatCount(stats.artists)} artists played`}
        title={`Top artists, ${suffix}`}
      />
      <ol className="stats__topList">
        {artists.map((artist, i) => (
          <li
            className={cx('stats__topArtistRow', i === 0 && 'stats__topRow--lead')}
            key={artist.id}
          >
            <span className="stats__rankBadge">{String(i + 1).padStart(2, '0')}</span>
            <span className="stats__repeatName">
              <ArtistLinks
                artists={[artist]}
                className="stats__label"
                newArtists={stats.newArtists}
              />
              <span className="stats__meta">
                {formatCount(artist.tracks)} {artist.tracks === 1 ? 'track' : 'tracks'} ·{' '}
                {formatHours((artist.plays * stats.minutesPerPlay) / 60)}
              </span>
            </span>
            <span aria-hidden="true" className="stats__meter" style={bar(artist.plays, top)} />
            <span className="stats__topCountGroup">
              <span className="stats__count">{formatCount(artist.plays)}</span>
              <span className="stats__meta">{formatPercent(artist.plays, stats.plays)}</span>
            </span>
          </li>
        ))}
      </ol>
    </PaperCard>
  );
}

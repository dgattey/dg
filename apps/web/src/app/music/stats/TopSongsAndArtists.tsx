import type { ListeningStats } from '@dg/services/spotify/fetchListeningStats';
import { Tooltip } from '@dg/ui/core/Tooltip';
import { Image } from '@dg/ui/dependent/Image';
import type { CSSProperties } from 'react';
import { PaperCard } from '../../collage/PaperCard';
import { cx } from '../../collage/paperVars';
import { formatCount, formatHours, formatPercent, formatRangeSuffix } from './listeningStatsFormat';
import { bar, CardHead } from './StatsCardParts';

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
            {track.albumImageUrl ? (
              <span
                className="stats__mat stats__songMat"
                style={
                  {
                    '--r': `${SONG_ART_TILTS[i % SONG_ART_TILTS.length] ?? 0}deg`,
                  } as CSSProperties
                }
              >
                <Image
                  alt={`${track.albumName || track.name} by ${track.artistNames}`}
                  height={44}
                  sizes={{ extraLarge: 44 }}
                  url={track.albumImageUrl}
                  width={44}
                />
              </span>
            ) : null}
            <span className="stats__repeatName">
              <Tooltip title={track.name} whenTruncated>
                {track.url ? (
                  <a
                    className="stats__label stats__itemLink"
                    href={track.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {track.name}
                  </a>
                ) : (
                  <span className="stats__label">{track.name}</span>
                )}
              </Tooltip>
              <Tooltip title={track.artistNames} whenTruncated>
                <span className="stats__meta">{track.artistNames}</span>
              </Tooltip>
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
              <Tooltip title={artist.name} whenTruncated>
                {artist.url ? (
                  <a
                    className="stats__label stats__itemLink"
                    href={artist.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {artist.name}
                  </a>
                ) : (
                  <span className="stats__label">{artist.name}</span>
                )}
              </Tooltip>
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

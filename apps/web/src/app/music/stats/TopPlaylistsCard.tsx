import type { ListeningStats } from '@dg/services/spotify/fetchListeningStats';
import { Tooltip } from '@dg/ui/core/Tooltip';
import { Image } from '@dg/ui/dependent/Image';
import type { CSSProperties } from 'react';
import { PaperCard } from '../../collage/PaperCard';
import { cx } from '../../collage/paperVars';
import { formatCount, formatHours, formatRangeSuffix } from './listeningStatsFormat';
import { bar, CardHead } from './StatsCardParts';
import { SpotifyAnchor } from './StatsLinks';

const PLAYLIST_ART_TILTS = [-2.2, 1.8, -1.6, 2.1, -1.9, 1.5] as const;

export function TopPlaylistsCard({ stats }: { stats: ListeningStats }) {
  const playlists = stats.topPlaylists.slice(0, 6);
  if (playlists.length === 0) {
    return null;
  }
  const top = playlists[0]?.plays ?? 1;
  const suffix = formatRangeSuffix(stats.range);
  return (
    <PaperCard
      className="stats__card stats__topPlaylists"
      edge="soft-a"
      innerClassName="stats__pad"
      tiltDeg={0.6}
      tone="black"
    >
      <CardHead
        aside={`${formatCount(playlists.length)} most-played ${playlists.length === 1 ? 'playlist' : 'playlists'}`}
        title={`Top playlists, ${suffix}`}
      />
      <ol className="stats__playlistGrid">
        {playlists.map((playlist, i) => (
          <li
            className={cx('stats__playlistItem', i === 0 && 'stats__topRow--lead')}
            key={playlist.id}
          >
            <SpotifyAnchor
              className="stats__playlistArtLink"
              href={playlist.url}
              label={playlist.name}
            >
              <span
                className="stats__mat stats__playlistMat"
                style={
                  {
                    '--r': `${PLAYLIST_ART_TILTS[i % PLAYLIST_ART_TILTS.length] ?? 0}deg`,
                  } as CSSProperties
                }
              >
                <Image
                  alt={`${playlist.name} cover`}
                  height={64}
                  sizes={{ extraLarge: 64 }}
                  url={playlist.imageUrl}
                  width={64}
                />
              </span>
            </SpotifyAnchor>
            <div className="stats__playlistBody">
              <div className="stats__playlistHeader">
                <span className="stats__rankBadge">{String(i + 1).padStart(2, '0')}</span>
                <Tooltip title={playlist.name} whenTruncated>
                  <SpotifyAnchor className="stats__label stats__playlistTitle" href={playlist.url}>
                    {playlist.name}
                  </SpotifyAnchor>
                </Tooltip>
                <span className="stats__count stats__playlistPlays">
                  {formatCount(playlist.plays)}
                </span>
              </div>
              <span aria-hidden="true" className="stats__meter" style={bar(playlist.plays, top)} />
              <div className="stats__playlistMetaRow">
                <span className="stats__meta stats__playlistSub">
                  {formatCount(playlist.playedTracks)} of {formatCount(playlist.totalTracks)}{' '}
                  {playlist.totalTracks === 1 ? 'track' : 'tracks'} ·{' '}
                  {formatHours((playlist.plays * stats.minutesPerPlay) / 60)}
                </span>
                {playlist.topTrack ? (
                  <Tooltip title={playlist.topTrack.name} whenTruncated>
                    <SpotifyAnchor
                      className="stats__meta stats__playlistTopTrack"
                      href={playlist.topTrack.url}
                    >
                      #1 {playlist.topTrack.name}
                    </SpotifyAnchor>
                  </Tooltip>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </PaperCard>
  );
}

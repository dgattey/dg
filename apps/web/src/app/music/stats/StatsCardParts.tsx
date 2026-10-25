import type { ListeningStats, StatsAlbumRef } from '@dg/services/spotify/fetchListeningStats';
import { formatCount } from '@dg/shared-core/formatting/formattedDistance';
import { favoriteAlbumsRoute, musicRoute } from '@dg/shared-core/routes/app';
import { Tooltip } from '@dg/ui/core/Tooltip';
import { PageTransitionLink } from '@dg/ui/core/transitions/PageTransitionLink';
import { Image } from '@dg/ui/dependent/Image';
import type { CSSProperties, ReactNode } from 'react';
import { PaperCard } from '../../collage/PaperCard';
import { cx } from '../../collage/paperVars';
import type { PaperTone } from '../../collage/types';
import { formatDay, formatPercent } from './listeningStatsFormat';
import { AlbumLink, ArtistLinks, SpotifyAnchor } from './StatsLinks';
import { Scallop, Stub } from './StatsShapes';

const CRATE_TILTS = [-3, 2.4, -1.6, 3] as const;

type BarStyle = CSSProperties & { '--bar': string };

export const bar = (part: number, whole: number): BarStyle => ({
  '--bar': whole > 0 ? String(part / whole) : '0',
});

export function Cover({
  album,
  eager = false,
  matTone,
  size,
}: {
  album: StatsAlbumRef;
  /** For the cover that is often the largest paint, so it never waits on lazy loading. */
  eager?: boolean;
  matTone?: PaperTone;
  size: number;
}) {
  return (
    <span
      className="stats__mat"
      style={matTone ? ({ '--mat-bg': `var(--${matTone})` } as CSSProperties) : undefined}
    >
      <Image
        alt={`${album.name} cover`}
        height={size}
        loading={eager ? 'eager' : undefined}
        sizes={{ extraLarge: size }}
        url={album.imageUrl}
        width={size}
      />
    </span>
  );
}

export function CardHead({ aside, title }: { aside?: ReactNode; title: string }) {
  return (
    <div className="stats__head">
      <h2 className="stats__heading">{title}</h2>
      {aside ? <p className="stats__aside">{aside}</p> : null}
    </div>
  );
}

export function OnRepeatCard({ stats }: { stats: ListeningStats }) {
  const top = stats.onRepeat[0]?.plays ?? 0;
  const isDailyRepeat = stats.range.kind === 'week';
  return (
    <PaperCard
      className="stats__card stats__repeat"
      edge="quad-b"
      innerClassName="stats__pad"
      tag={
        top > 0 ? (
          <Stub className="stats__cardStamp" kind="ticket" size="sm" tiltDeg={3.8} tone="ochre">
            <span className="stats__cardStampKicker">
              {isDailyRepeat ? 'Most in a day' : 'Most in a week'}
            </span>
            <span className="stats__cardStampValue">{top} plays</span>
          </Stub>
        ) : undefined
      }
      tiltDeg={1.2}
      tone="vermilion"
    >
      <CardHead
        aside={
          isDailyRepeat ? 'Most plays of one track in a day' : 'Most plays of one track in a week'
        }
        title="On repeat"
      />
      <ol className="stats__repeatList">
        {stats.onRepeat.map(({ plays, track, week }, i) => (
          <li className="stats__repeatRow" key={track.id}>
            <span className="stats__rank">{String(i + 1).padStart(2, '0')}</span>
            <AlbumLink album={track.album} label={track.album.name}>
              <Cover album={track.album} size={40} />
            </AlbumLink>
            <span className="stats__repeatName">
              <Tooltip title={track.name} whenTruncated>
                <SpotifyAnchor className="stats__label" href={track.url}>
                  {track.name}
                </SpotifyAnchor>
              </Tooltip>
              <ArtistLinks artists={track.artists} newArtists={stats.newArtists} />
            </span>
            <span className="stats__topCountGroup">
              <span className="stats__count">{plays}</span>
              <span className="stats__meta stats__date">
                <span className="chrome__srOnly">{isDailyRepeat ? 'On ' : 'Week of '}</span>
                {formatDay(week)}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </PaperCard>
  );
}

export function FrontToBackCard({ stats }: { stats: ListeningStats }) {
  const albums = [...stats.frontToBack].sort(
    (a, b) => b.sessionPlays / b.plays - a.sessionPlays / a.plays,
  );
  return (
    <PaperCard
      className="stats__card stats__rituals"
      edge="soft-b"
      innerClassName="stats__ritualsInner"
      tag={
        <Scallop className="stats__cardSeal" tiltDeg={-7.5} tone="rose">
          <span className="stats__cardSealTop">5+</span>
          <span className="stats__cardSealSub">in a row</span>
        </Scallop>
      }
      tiltDeg={0.9}
      tone="black"
    >
      <div className="stats__ritualsLead">
        <h2 className="stats__heading">Front to back</h2>
        <p className="stats__meta">
          How much of each album I heard while playing 5 or more of its songs in a row.
        </p>
      </div>
      <ul className="stats__ritualList">
        {albums.map(({ album, plays, sessionPlays, sessions }, i) => (
          <li className="stats__ritual" key={album.id}>
            <span
              className="stats__ritualArt"
              style={{ '--r': `${CRATE_TILTS[i % CRATE_TILTS.length] ?? 0}deg` } as CSSProperties}
            >
              <AlbumLink album={album} label={album.name}>
                <Cover album={album} size={96} />
              </AlbumLink>
              <Scallop
                className="stats__ritualSticker"
                size="sticker"
                tiltDeg={i % 2 === 0 ? 12 : -10}
                tone="ochre"
              >
                {formatPercent(sessionPlays, plays, 0)}
              </Scallop>
            </span>
            <div>
              <AlbumLink album={album} className="stats__label">
                {album.name}
              </AlbumLink>
              <ArtistLinks artists={album.artists} newArtists={stats.newArtists} />
            </div>
            <span aria-hidden="true" className="stats__meter" style={bar(sessionPlays, plays)} />
            <span className="stats__meta">
              {formatCount(sessions)} {sessions === 1 ? 'time' : 'times'} through,{' '}
              {formatCount(sessionPlays)} of {formatCount(plays)} plays
            </span>
          </li>
        ))}
      </ul>
    </PaperCard>
  );
}

export function DepthCard({ stats }: { stats: ListeningStats }) {
  const perTrack = (artist: ListeningStats['topArtists'][number]) => artist.plays / artist.tracks;
  const most = (pick: (artist: ListeningStats['topArtists'][number]) => number) =>
    Math.max(...stats.topArtists.map(pick));
  const highlight = (value: number, max: number) =>
    cx('stats__cell', value === max && 'stats__cell--max');
  const topMonths = most((a) => a.months);
  return (
    <PaperCard
      className="stats__card stats__depth"
      edge="quad-d"
      innerClassName="stats__pad"
      tag={
        <Stub className="stats__cardStamp" kind="stamp" tiltDeg={-4.2} tone="viridian">
          <span className="stats__cardStampKicker">Loyal for</span>
          <span className="stats__cardStampValue">{topMonths} mo</span>
        </Stub>
      }
      tiltDeg={-0.7}
    >
      <CardHead
        aside={`${formatCount(stats.activeMonths)} active months`}
        title="Depth and loyalty"
      />
      <table className="stats__table">
        <thead>
          <tr>
            <th className="stats__rank" scope="col">
              <span className="chrome__srOnly">Rank</span>
            </th>
            <th scope="col">Artist</th>
            <th className="stats__cell" scope="col">
              Plays
            </th>
            <th className="stats__cell" scope="col">
              Tracks
            </th>
            <th className="stats__cell" scope="col">
              Per track
            </th>
            <th className="stats__cell stats__monthsHead" scope="col">
              Months
            </th>
          </tr>
        </thead>
        <tbody>
          {stats.topArtists.map((artist, i) => (
            <tr key={artist.id}>
              <td className="stats__rank">{String(i + 1).padStart(2, '0')}</td>
              <th className="stats__artist" scope="row">
                <ArtistLinks artists={[artist]} newArtists={stats.newArtists} />
              </th>
              <td className="stats__cell">{formatCount(artist.plays)}</td>
              <td
                className={highlight(
                  artist.tracks,
                  most((a) => a.tracks),
                )}
              >
                {formatCount(artist.tracks)}
              </td>
              <td className={highlight(perTrack(artist), most(perTrack))}>
                {perTrack(artist).toFixed(1)}
              </td>
              <td className="stats__months">
                <span
                  aria-hidden="true"
                  className="stats__meter"
                  style={bar(artist.months, stats.activeMonths)}
                />
                <span className={highlight(artist.months, topMonths)}>{artist.months}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </PaperCard>
  );
}

/**
 * Collage stickers tucked into the open pocket beneath `Depth and loyalty`, beside the
 * taller `Front to back` card. Each one says its fact in a plain sentence or opens a page.
 */
export function DepthPocketStickers({ stats }: { stats: ListeningStats }) {
  const topArtist = stats.topArtists[0];
  return (
    <div className="stats__pocketCluster">
      <PageTransitionLink
        className="stats__pocketLink collageLift"
        href={favoriteAlbumsRoute}
        title="Favorite albums"
      >
        <Stub className="stats__pocketStub" kind="stamp" tiltDeg={3.8} tone="cobalt">
          <span className="stats__meta stats__totalLabel">My favorite albums</span>
          <span className="stats__pocketNumber">{formatCount(stats.shelf.albums)}</span>
          <span className="stats__meta stats__totalSub">See them all →</span>
        </Stub>
      </PageTransitionLink>
      {topArtist ? (
        <Scallop className="stats__pocketSeal" tiltDeg={-5.8} tone="ochre">
          <span className="stats__meta stats__totalLabel">Top artist</span>
          <span className="stats__pocketSealVal">
            {formatPercent(topArtist.plays, stats.plays, 0)}
          </span>
          <span className="stats__meta stats__totalSub">of plays were {topArtist.name}</span>
        </Scallop>
      ) : null}
      <PageTransitionLink
        className="stats__pocketLink collageLift"
        href={musicRoute}
        title="Listening history"
      >
        <Stub className="stats__pocketStub" kind="ticket" tiltDeg={2.9} tone="vermilion">
          <span className="stats__meta stats__totalLabel">Every play, newest first</span>
          <span className="stats__pocketNumber">{formatCount(stats.plays)}</span>
          <span className="stats__meta stats__totalSub">Full listening history →</span>
        </Stub>
      </PageTransitionLink>
    </div>
  );
}

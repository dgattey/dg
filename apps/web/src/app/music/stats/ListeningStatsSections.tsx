import type { ListeningStats } from '@dg/services/spotify/fetchListeningStats';
import { ALBUM_SESSION_MIN_PLAYS } from '@dg/services/spotify/listeningStatsQueries';
import type { CSSProperties } from 'react';
import { PaperCard } from '../../collage/PaperCard';
import { cx } from '../../collage/paperVars';
import { ListeningClock } from './ListeningClock';
import { WeekCard, YearsCard } from './ListeningStatsCharts';
import { ListeningStatsTotals } from './ListeningStatsTotals';
import { formatCount, formatDay, formatPercent } from './listeningStatsFormat';
import { bar, CardHead, Cover } from './StatsCardParts';
import { Scallop } from './StatsShapes';
import { TopAlbumsPodium } from './TopAlbumsPodium';

const CRATE_TILTS = [-3, 2.4, -1.6, 3] as const;

function OnRepeatCard({ stats }: { stats: ListeningStats }) {
  const top = stats.onRepeat[0]?.plays ?? 0;
  return (
    <PaperCard
      className="stats__card stats__repeat"
      edge="quad-b"
      innerClassName="stats__pad"
      tiltDeg={1.2}
      tone="vermilion"
    >
      <CardHead aside="Most plays of one track in a week" title="On repeat" />
      <ol className="stats__repeatList">
        {stats.onRepeat.map(({ plays, track, week }, i) => (
          <li className={cx('stats__repeatRow', i === 0 && 'stats__repeatRow--top')} key={track.id}>
            <span className="stats__rank">{String(i + 1).padStart(2, '0')}</span>
            <span className="stats__repeatName">
              <span className="stats__label">{track.name}</span>
              <span className="stats__meta">{track.artistNames}</span>
            </span>
            <span aria-hidden="true" className="stats__meter" style={bar(plays, top)} />
            <span className="stats__count">{plays}</span>
            <span className="stats__meta stats__date">
              <span className="chrome__srOnly">Week of </span>
              {formatDay(week)}
            </span>
          </li>
        ))}
      </ol>
    </PaperCard>
  );
}

function FrontToBackCard({ stats }: { stats: ListeningStats }) {
  const albums = [...stats.frontToBack].sort(
    (a, b) => b.sessionPlays / b.plays - a.sessionPlays / a.plays,
  );
  return (
    <PaperCard
      className="stats__card stats__rituals"
      edge="soft-b"
      innerClassName="stats__ritualsInner"
      tiltDeg={0.9}
      tone="black"
    >
      <div className="stats__ritualsLead">
        <h2 className="stats__heading">Front to back</h2>
        <p className="stats__meta">
          Albums I play start to finish: the share of each album heard in runs of{' '}
          {ALBUM_SESSION_MIN_PLAYS} or more tracks.
        </p>
      </div>
      <ul className="stats__ritualList">
        {albums.map(({ album, plays, sessionPlays, sessions }, i) => (
          <li className="stats__ritual" key={album.id}>
            <span
              className="stats__ritualArt"
              style={{ '--r': `${CRATE_TILTS[i % CRATE_TILTS.length] ?? 0}deg` } as CSSProperties}
            >
              <Cover album={album} size={96} />
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
              <span className="stats__label">{album.name}</span>
              <span className="stats__meta">{album.artistNames}</span>
            </div>
            <span aria-hidden="true" className="stats__meter" style={bar(sessionPlays, plays)} />
            <span className="stats__meta stats__ritualFoot">
              {formatCount(sessionPlays)} of {formatCount(plays)} plays, {formatCount(sessions)}{' '}
              sessions
            </span>
          </li>
        ))}
      </ul>
    </PaperCard>
  );
}

function DepthCard({ stats }: { stats: ListeningStats }) {
  const perTrack = (artist: ListeningStats['depth'][number]) => artist.plays / artist.tracks;
  const most = (pick: (artist: ListeningStats['depth'][number]) => number) =>
    Math.max(...stats.depth.map(pick));
  const highlight = (value: number, max: number) =>
    cx('stats__cell', value === max && 'stats__cell--max');
  return (
    <PaperCard
      className="stats__card stats__depth stats__taped"
      edge="quad-d"
      innerClassName="stats__pad"
      tiltDeg={-0.7}
    >
      <CardHead
        aside={`Top artists by plays. Months with a play, of ${formatCount(stats.activeMonths)}`}
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
          {stats.depth.map((artist, i) => (
            <tr key={artist.name}>
              <td className="stats__rank">{String(i + 1).padStart(2, '0')}</td>
              <th className="stats__artist" scope="row">
                {artist.name}
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
                <span
                  className={highlight(
                    artist.months,
                    most((a) => a.months),
                  )}
                >
                  {artist.months}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </PaperCard>
  );
}

/**
 * Everything below the page title on `/music/stats`: totals on stubs and seals,
 * the top album podium, then three ragged bands of cards.
 */
export function ListeningStatsSections({ stats }: { stats: ListeningStats }) {
  return (
    <div className="stats__sections">
      <ListeningStatsTotals stats={stats} />
      <TopAlbumsPodium stats={stats} />
      <div className="stats__band">
        <YearsCard stats={stats} />
        <WeekCard stats={stats} />
      </div>
      <div className="stats__band">
        {stats.onRepeat.length > 0 ? <OnRepeatCard stats={stats} /> : null}
        <ListeningClock stats={stats} />
      </div>
      <div className="stats__band">
        {stats.depth.length > 0 ? <DepthCard stats={stats} /> : null}
        {stats.frontToBack.length > 0 ? <FrontToBackCard stats={stats} /> : null}
      </div>
    </div>
  );
}

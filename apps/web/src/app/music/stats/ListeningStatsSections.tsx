import {
  ALBUM_SESSION_MIN_PLAYS,
  type ListeningStats,
  type StatsAlbum,
} from '@dg/services/spotify/fetchListeningStats';
import { Image } from '@dg/ui/dependent/Image';
import type { CSSProperties, ReactNode } from 'react';
import { PaperCard } from '../../collage/PaperCard';
import { cx } from '../../collage/paperVars';
import {
  formatCompact,
  formatCount,
  formatDay,
  formatHourRange,
  formatMonth,
  formatPacificDay,
  formatPercent,
  formatYearTick,
  HOUR_SHIFTS,
  hourShift,
  peakHours,
  playsInShift,
  weekdayExtremes,
  weekdayGroups,
} from './listeningStatsFormat';

type BarStyle = CSSProperties & { '--bar': string };

const bar = (part: number, whole: number): BarStyle => ({
  '--bar': whole > 0 ? String(part / whole) : '0',
});

function Cover({ album, size }: { album: StatsAlbum; size: number }) {
  return (
    <span className="stats__mat">
      <Image
        alt={`${album.name} by ${album.artistNames}`}
        height={size}
        sizes={{ extraLarge: size }}
        url={album.imageUrl}
        width={size}
      />
    </span>
  );
}

function CardHead({ aside, title }: { aside?: ReactNode; title: string }) {
  return (
    <div className="stats__head">
      <h2 className="stats__heading">{title}</h2>
      {aside ? <p className="stats__aside">{aside}</p> : null}
    </div>
  );
}

function Figure({
  label,
  sub,
  tiltDeg,
  value,
}: {
  label: string;
  sub: string;
  tiltDeg: number;
  value: string;
}) {
  return (
    <PaperCard className="stats__figure" innerClassName="stats__figureInner" tiltDeg={tiltDeg}>
      <span className="stats__meta">{label}</span>
      <span className="stats__number">{value}</span>
      <span className="stats__meta">{sub}</span>
    </PaperCard>
  );
}

function Figures({ stats }: { stats: ListeningStats }) {
  const hours = (stats.plays * stats.minutesPerPlay) / 60;
  return (
    <section aria-label="Totals" className="stats__figures">
      <Figure
        label="Plays"
        sub={`${formatCount(stats.tracks)} tracks, ${formatCount(stats.artists)} artists`}
        tiltDeg={-0.6}
        value={formatCount(stats.plays)}
      />
      <Figure
        label="Listening time"
        sub={`Est. at ${stats.minutesPerPlay.toFixed(2)} min per play`}
        tiltDeg={0.5}
        value={`${formatCount(hours)}h`}
      />
      <Figure
        label="Active days"
        sub={`${formatCount(stats.activeDays)} of ${formatCount(stats.spanDays)} days`}
        tiltDeg={-0.4}
        value={formatPercent(stats.activeDays, stats.spanDays)}
      />
      <Figure
        label="Months in a row"
        sub={`${formatMonth(stats.monthStreak.start)} to ${formatMonth(stats.monthStreak.end)}`}
        tiltDeg={0.6}
        value={formatCount(stats.monthStreak.months)}
      />
      <Figure
        label="Whole albums"
        sub={`of plays, in ${formatCount(stats.sessions)} sessions`}
        tiltDeg={-0.5}
        value={formatPercent(stats.sessionPlays, stats.plays)}
      />
      <Figure
        label="From the shelf"
        sub={`${formatCount(stats.shelf.plays)} plays, ${formatCount(stats.shelf.albums)} albums`}
        tiltDeg={0.4}
        value={formatPercent(stats.shelf.plays, stats.plays)}
      />
    </section>
  );
}

function YearsCard({ stats }: { stats: ListeningStats }) {
  const max = Math.max(...stats.years.map((year) => year.plays));
  const peak = stats.years.find((year) => year.plays === max);
  const last = stats.years.length - 1;
  return (
    <PaperCard
      className="stats__card stats__years"
      innerClassName="stats__pad"
      tiltDeg={-0.5}
      tone="viridian"
    >
      <CardHead
        aside={
          peak ? (
            <span className="stats__peak">
              Peak {peak.year}: {formatCount(peak.plays)} plays,{' '}
              {formatCount((peak.plays * stats.minutesPerPlay) / 60)} hours
            </span>
          ) : null
        }
        title="Plays per year"
      />
      <ol className="stats__columns" style={{ '--count': stats.years.length } as CSSProperties}>
        {stats.years.map((year, i) => (
          <li
            className={cx(
              'stats__column',
              year === peak && 'stats__column--peak',
              year !== peak && (i === 0 || i === last) && 'stats__column--partial',
            )}
            key={year.year}
          >
            <span className="stats__columnValue">
              {year === peak ? formatCompact(year.plays) : null}
            </span>
            <span aria-hidden="true" className="stats__columnBar" style={bar(year.plays, max)} />
            <span className="stats__columnTick">
              <span className="stats__visuallyHidden">{year.year}</span>
              <span aria-hidden="true">{formatYearTick(year.year)}</span>
            </span>
            <span className="stats__visuallyHidden">: {formatCount(year.plays)} plays</span>
          </li>
        ))}
      </ol>
      <p className="stats__note">
        Faded columns are partial years, from {formatPacificDay(stats.firstPlayedAt)} to{' '}
        {formatPacificDay(stats.lastPlayedAt)}.
      </p>
    </PaperCard>
  );
}

function TopAlbumsCard({ stats }: { stats: ListeningStats }) {
  return (
    <PaperCard
      className="stats__card stats__albums"
      innerClassName="stats__pad"
      tiltDeg={0.6}
      tone="ochre"
    >
      <CardHead title="Top albums, all time" />
      <ol className="stats__albumList">
        {stats.topAlbums.map(({ album, plays }, i) => (
          <li className="stats__album" key={album.id}>
            <Cover album={album} size={76} />
            <div>
              <span className="stats__meta">#{i + 1}</span>
              <span className="stats__rowTitle">{album.name}</span>
              <span className="stats__meta">{album.artistNames}</span>
            </div>
            <span className="stats__count">{formatCount(plays)}</span>
          </li>
        ))}
      </ol>
      <p className="stats__note">
        <strong>{stats.shelf.topTenOnShelf} of the top 10</strong> are on my shelf
      </p>
    </PaperCard>
  );
}

function OnRepeatCard({ stats }: { stats: ListeningStats }) {
  const top = stats.onRepeat[0]?.plays ?? 0;
  return (
    <PaperCard
      className="stats__card stats__repeat"
      innerClassName="stats__pad"
      tiltDeg={0.5}
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
              <span className="stats__visuallyHidden">Week of </span>
              {formatDay(week)}
            </span>
          </li>
        ))}
      </ol>
    </PaperCard>
  );
}

function DayCard({ stats }: { stats: ListeningStats }) {
  const max = Math.max(...stats.hours);
  const peak = peakHours(stats.hours, 2);
  const isPeak = (hour: number) => (hour - peak.start + 24) % 24 < 2;
  // Hour columns are narrower than a value label, so only the busiest one carries a number.
  const busiest = stats.hours.indexOf(max);
  return (
    <PaperCard className="stats__card stats__day" innerClassName="stats__pad">
      <CardHead
        aside={`${formatHourRange(peak.start, 2)} peak: ${formatCount(peak.plays)} plays, ${formatPercent(peak.plays, stats.plays)}`}
        title="A day of listening, Pacific time"
      />
      <ol className="stats__hours">
        {stats.hours.map((plays, hour) => (
          <li
            className={cx(
              'stats__hour',
              `stats__hour--${hourShift(hour)}`,
              isPeak(hour) && 'stats__hour--peak',
            )}
            // biome-ignore lint/suspicious/noArrayIndexKey: the index is the hour itself
            key={hour}
          >
            <span className="stats__hourValue">
              {hour === busiest ? formatCompact(plays) : null}
            </span>
            <span aria-hidden="true" className="stats__hourBar" style={bar(plays, max)} />
            <span className="stats__hourTick">{String(hour).padStart(2, '0')}</span>
            <span className="stats__visuallyHidden">: {formatCount(plays)} plays</span>
          </li>
        ))}
      </ol>
      <ul className="stats__shifts">
        {HOUR_SHIFTS.map(({ label, shift }) => (
          <li className={`stats__shift stats__shift--${shift}`} key={shift}>
            <span aria-hidden="true" className="stats__swatch" />
            <span className="stats__shiftShare">
              {formatPercent(playsInShift(stats.hours, shift), stats.plays)}
            </span>
            <span className="stats__meta">{label}</span>
          </li>
        ))}
      </ul>
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
      innerClassName="stats__ritualsInner"
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
        {albums.map(({ album, plays, sessionPlays, sessions }) => (
          <li className="stats__ritual" key={album.id}>
            <Cover album={album} size={62} />
            <div>
              <span className="stats__label">{album.name}</span>
              <span className="stats__meta">{album.artistNames}</span>
              <span className="stats__share">{formatPercent(sessionPlays, plays, 0)}</span>
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
    <PaperCard className="stats__card stats__depth" innerClassName="stats__pad">
      <CardHead
        aside={`Top artists by plays. Months with a play, of ${formatCount(stats.activeMonths)}`}
        title="Depth and loyalty"
      />
      <table className="stats__table">
        <thead>
          <tr>
            <th className="stats__rank" scope="col">
              <span className="stats__visuallyHidden">Rank</span>
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

function WeekCard({ stats }: { stats: ListeningStats }) {
  const groups = weekdayGroups(stats.weekdays);
  const { busiest, quietest } = weekdayExtremes(stats.weekdays);
  return (
    <PaperCard
      className="stats__card stats__week"
      innerClassName="stats__pad"
      tiltDeg={-0.6}
      tone="rose"
    >
      <CardHead title="Day of week" />
      <div aria-hidden="true" className="stats__split">
        {groups.map((group, i) => (
          <span
            className={`stats__splitPart stats__splitPart--${i}`}
            key={group.label}
            style={{ flexGrow: group.plays }}
          />
        ))}
      </div>
      <ul className="stats__splitKey">
        {groups.map((group, i) => (
          <li key={group.label}>
            <span aria-hidden="true" className={`stats__swatch stats__splitPart--${i}`} />
            <span>{group.label}</span>
            <span className="stats__meta">{formatCount(group.plays)}</span>
            <span className="stats__splitShare">{formatPercent(group.plays, stats.plays)}</span>
          </li>
        ))}
      </ul>
      <p className="stats__facts">
        <span>
          Busiest: <strong>{busiest.name}</strong>, {formatCount(busiest.plays)}
        </span>
        <span>
          Quietest: <strong>{quietest.name}</strong>, {formatCount(quietest.plays)}
        </span>
      </p>
      {stats.dayRepeats.length > 0 ? (
        <>
          <h3 className="stats__subheading">One track, one day</h3>
          <ul className="stats__dayRepeats">
            {stats.dayRepeats.map(({ day, plays, track }) => (
              <li key={track.id}>
                <span className="stats__label">{track.name}</span>
                <span className="stats__count">{plays}</span>
                <span className="stats__meta stats__date">{formatDay(day)}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </PaperCard>
  );
}

/**
 * Everything below the page title on `/music/stats`: six totals, then four
 * bands of cards in the approved bento order.
 */
export function ListeningStatsSections({ stats }: { stats: ListeningStats }) {
  return (
    <div className="stats__sections">
      <Figures stats={stats} />
      <div className="stats__band">
        <YearsCard stats={stats} />
        {stats.topAlbums.length > 0 ? <TopAlbumsCard stats={stats} /> : null}
      </div>
      <div className="stats__band">
        {stats.onRepeat.length > 0 ? <OnRepeatCard stats={stats} /> : null}
        <DayCard stats={stats} />
      </div>
      {stats.frontToBack.length > 0 ? (
        <div className="stats__band">
          <FrontToBackCard stats={stats} />
        </div>
      ) : null}
      <div className="stats__band">
        {stats.depth.length > 0 ? <DepthCard stats={stats} /> : null}
        <WeekCard stats={stats} />
      </div>
    </div>
  );
}

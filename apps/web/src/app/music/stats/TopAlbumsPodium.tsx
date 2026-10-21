import type { ListeningStats } from '@dg/services/spotify/fetchListeningStats';
import type { CSSProperties } from 'react';
import { PaperCard } from '../../collage/PaperCard';
import { cx, paperSurfaceVars } from '../../collage/paperVars';
import type { PaperTone } from '../../collage/types';
import { formatCount } from './listeningStatsFormat';
import { Cover } from './StatsCardParts';
import { Scallop, Stub, Vinyl } from './StatsShapes';

type RunnerUpCut = {
  matTone: PaperTone;
  sticker: 'circle' | 'ticket';
  stickerTiltDeg: number;
  stickerTone: PaperTone;
  tiltDeg: number;
};

/** Second and third place hang off the hero at their own angles. */
const RUNNER_UP_CUTS: ReadonlyArray<RunnerUpCut> = [
  { matTone: 'ochre', sticker: 'circle', stickerTiltDeg: 14, stickerTone: 'cream', tiltDeg: 3 },
  {
    matTone: 'rose',
    sticker: 'ticket',
    stickerTiltDeg: -18,
    stickerTone: 'viridian',
    tiltDeg: -2.8,
  },
];

function RankSticker({ cut, rank }: { cut: RunnerUpCut; rank: number }) {
  const label = `#${String(rank).padStart(2, '0')}`;
  return cut.sticker === 'ticket' ? (
    <Stub
      className="stats__rankSticker"
      kind="ticket"
      tiltDeg={cut.stickerTiltDeg}
      tone={cut.stickerTone}
    >
      {label}
    </Stub>
  ) : (
    <span
      className="stats__rankSticker stats__rankCircle"
      style={paperSurfaceVars(cut.stickerTone, 'quad-a', cut.stickerTiltDeg)}
    >
      {label}
    </span>
  );
}

/**
 * The top album as a sleeve with its record sliding out over a cut paper pebble,
 * and the runners-up pinned beside it.
 */
export function TopAlbumsPodium({ stats }: { stats: ListeningStats }) {
  const [first, ...rest] = stats.topAlbums;
  if (!first) {
    return null;
  }
  return (
    <section className="stats__podium">
      <h2 className="paperTag stats__sectionTag" style={paperSurfaceVars('black', 'quad-c', -2)}>
        Top albums, all time
      </h2>
      <div className="stats__hero">
        <div className="stats__heroArt">
          <span aria-hidden="true" className="stats__heroBlob" />
          <Vinyl className="stats__heroVinyl" />
          <span className="stats__heroSleeve">
            <Cover album={first.album} eager={true} size={280} />
          </span>
          <Scallop className="stats__heroStamp" tiltDeg={-12} tone="ochre">
            <span className="stats__heroRank">#1</span>
            <span className="stats__meta">all time</span>
          </Scallop>
        </div>
        <PaperCard
          className="stats__heroCard"
          edge="soft-b"
          innerClassName="stats__heroInner"
          tiltDeg={1.2}
        >
          <span className="stats__meta">Most played album</span>
          <span className="stats__heroTitle">{first.album.name}</span>
          <span className="stats__meta">{first.album.artistNames}</span>
          <span className="stats__heroPlays">
            {formatCount(first.plays)} <span className="stats__meta">plays</span>
          </span>
          <p className="stats__note">
            <strong>{stats.shelf.topTenOnShelf} of the top 10</strong> are on my shelf
          </p>
        </PaperCard>
      </div>
      {rest.length > 0 ? (
        <ol className="stats__runnersUp" start={2}>
          {rest.map(({ album, plays }, i) => {
            const cut = RUNNER_UP_CUTS[i];
            if (!cut) {
              return null;
            }
            return (
              <li
                className={cx('stats__runnerUp', i % 2 === 1 && 'stats__runnerUp--offset')}
                key={album.id}
                style={{ '--r': `${cut.tiltDeg}deg` } as CSSProperties}
              >
                <span className="stats__runnerArt">
                  <Cover album={album} matTone={cut.matTone} size={150} />
                  <RankSticker cut={cut} rank={i + 2} />
                </span>
                <span className="stats__runnerCaption">
                  <span className="stats__label">{album.name}</span>
                  <span className="stats__meta">{album.artistNames}</span>
                  <span className="stats__count">{formatCount(plays)}</span>
                </span>
              </li>
            );
          })}
        </ol>
      ) : null}
    </section>
  );
}

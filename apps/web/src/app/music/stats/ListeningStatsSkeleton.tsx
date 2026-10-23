import { PaperCard } from '../../collage/PaperCard';
import { TOTAL_CUTS, TotalPaper } from './ListeningStatsTotals';

/** Blank paper in the shape of the stats, so the page doesn't jump when they land. */
export function ListeningStatsSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading listening stats"
      className="stats__sections"
      role="status"
    >
      <ul className="stats__totals">
        {Object.entries(TOTAL_CUTS).map(([key, cut]) => (
          <li className={`stats__totalSlot stats__totalSlot--${key}`} key={key}>
            <TotalPaper cut={cut}>{null}</TotalPaper>
          </li>
        ))}
      </ul>
      <div className="stats__band">
        <PaperCard
          className="stats__card stats__years"
          edge="soft-a"
          innerClassName="stats__pad stats__skeleton"
          tiltDeg={-1.1}
          tone="viridian"
        />
        <PaperCard
          className="stats__card stats__week"
          edge="soft-b"
          innerClassName="stats__pad stats__skeleton"
          tiltDeg={1.4}
          tone="rose"
        />
      </div>
    </div>
  );
}

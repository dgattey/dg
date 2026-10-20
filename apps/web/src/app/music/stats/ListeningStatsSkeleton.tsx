import { PaperCard } from '../../collage/PaperCard';

const FIGURE_TILTS = [-0.6, 0.5, -0.4, 0.6, -0.5, 0.4] as const;

/** Blank paper in the shape of the stats, so the page doesn't jump when they land. */
export function ListeningStatsSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading listening stats"
      className="stats__sections"
      role="status"
    >
      <div className="stats__figures">
        {FIGURE_TILTS.map((tiltDeg) => (
          <PaperCard
            className="stats__figure"
            innerClassName="stats__figureInner stats__skeleton"
            key={tiltDeg}
            tiltDeg={tiltDeg}
          />
        ))}
      </div>
      <div className="stats__band">
        <PaperCard
          className="stats__card stats__years"
          innerClassName="stats__pad stats__skeleton"
          tiltDeg={-0.5}
          tone="viridian"
        />
        <PaperCard
          className="stats__card stats__albums"
          innerClassName="stats__pad stats__skeleton"
          tiltDeg={0.6}
          tone="ochre"
        />
      </div>
    </div>
  );
}

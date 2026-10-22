import { PaperCard } from '../collage/PaperCard';
import type { PaperTone } from '../collage/types';
import { formatCompactFeet, formatFeet } from './stravaFormat';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;
const PETAL_TONES = [
  'ochre',
  'vermilion',
  'rose',
  'olive',
] as const satisfies ReadonlyArray<PaperTone>;
const SIZE = 350;
const CENTER = SIZE / 2;
const HEART = SIZE * 0.13;
const LABEL_GAP = 22;

const round = (value: number) => Math.round(value * 10) / 10;

/** A petal pointing right from the heart, `length` long, for a month's climbing. */
function petal(meters: number, most: number) {
  const length =
    meters > 0
      ? HEART + SIZE * 0.07 + (CENTER - HEART - SIZE * 0.165) * (meters / most)
      : HEART + SIZE * 0.033;
  const width = meters > 0 ? SIZE * 0.095 : SIZE * 0.024;
  const [base, belly, tip] = [round(HEART - 6), round(HEART + length * 0.25), round(length)];
  const shoulder = round(length - 10);
  const [w, w9] = [round(width), round(width * 0.9)];
  return {
    d: `M${base} 0C${belly} ${-w} ${shoulder} ${-w9} ${tip} 0C${shoulder} ${w9} ${belly} ${w} ${base} 0Z`,
    length,
    vein: `M${round(HEART + 4)} 0L${round(length - 16)} 0`,
  };
}

/**
 * Climbing as a cut-paper flower: one petal per calendar month, longer for
 * more feet. `span` names the stretch of time the months cover.
 */
export function ClimbingFlower({ months, span }: { months: ReadonlyArray<number>; span: string }) {
  const most = Math.max(0, ...months);
  const total = months.reduce((sum, meters) => sum + meters, 0);
  return (
    <PaperCard
      className="strava__card strava__flowerCard"
      edge="soft-b"
      innerClassName="strava__pad"
      tiltDeg={-2}
    >
      <div className="strava__head">
        <h2 className="strava__heading">Climbing by month</h2>
        <span className="strava__aside">{span}</span>
      </div>
      <svg
        aria-label={`${formatFeet(total)} feet climbed, ${span.toLowerCase()}, by month`}
        className="strava__flower"
        role="img"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
      >
        {months.map((meters, index) => {
          const angle = (index / 12) * 360 - 90;
          const radians = (angle * Math.PI) / 180;
          const { d, length, vein } = petal(meters, most);
          const placed = `translate(${CENTER} ${CENTER}) rotate(${angle})`;
          return (
            <g className={meters > 0 ? undefined : 'strava__petal--none'} key={MONTHS[index]}>
              <path
                className="strava__petal"
                d={d}
                style={
                  meters > 0
                    ? { fill: `var(--${PETAL_TONES[index % PETAL_TONES.length]})` }
                    : undefined
                }
                transform={placed}
              />
              {meters > 0 ? <path className="strava__vein" d={vein} transform={placed} /> : null}
              <text
                className="strava__month"
                x={round(CENTER + Math.cos(radians) * (length + LABEL_GAP))}
                y={round(CENTER + Math.sin(radians) * (length + LABEL_GAP))}
              >
                {MONTHS[index]}
              </text>
            </g>
          );
        })}
        <circle className="strava__flowerHeart" cx={CENTER} cy={CENTER} r={HEART} />
        <text className="strava__flowerTotal" x={CENTER} y={CENTER - 4}>
          {formatCompactFeet(total)}
        </text>
        <text className="strava__flowerUnit" x={CENTER} y={CENTER + 20}>
          feet
        </text>
      </svg>
    </PaperCard>
  );
}

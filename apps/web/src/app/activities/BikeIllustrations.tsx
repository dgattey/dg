import type { ReactNode } from 'react';

const REAR = { x: 27, y: 50 } as const;
const FRONT = { x: 95, y: 50 } as const;
const SPOKE_ANGLES = [0, 45, 90, 135] as const;

function Spokes({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g className="strava__bikeSpokes">
      {SPOKE_ANGLES.map((angle) => {
        const radians = (angle * Math.PI) / 180;
        const dx = Math.round(Math.cos(radians) * r * 10) / 10;
        const dy = Math.round(Math.sin(radians) * r * 10) / 10;
        return <line key={angle} x1={cx - dx} x2={cx + dx} y1={cy - dy} y2={cy + dy} />;
      })}
    </g>
  );
}

/** Deep carbon rims on slick tires. */
function AeroWheel({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle className="strava__bikeTire" cx={cx} cy={cy} r={20.5} />
      <circle className="strava__bikeDeepRim" cx={cx} cy={cy} r={16} />
      <Spokes cx={cx} cy={cy} r={12.5} />
      <circle className="strava__bikeHub" cx={cx} cy={cy} r={1.8} />
    </g>
  );
}

/** Shallow rims on knobby gravel tires. */
function GravelWheel({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle className="strava__bikeTire strava__bikeTire--knobby" cx={cx} cy={cy} r={20.5} />
      <circle className="strava__bikeTire" cx={cx} cy={cy} r={18.6} />
      <circle className="strava__bikeRim" cx={cx} cy={cy} r={16.6} />
      <Spokes cx={cx} cy={cy} r={16} />
      <circle className="strava__bikeHub" cx={cx} cy={cy} r={1.8} />
    </g>
  );
}

/** Frame tubes drawn twice: a dark contour underneath, then the paint. */
function Frame({ className, d }: { className: string; d: string }) {
  return (
    <g>
      <path className="strava__bikeContour" d={d} />
      <path className={className} d={d} />
    </g>
  );
}

function Illustration({ children, label }: { children: ReactNode; label: string }) {
  return (
    <svg aria-label={label} className="strava__bikeArt" role="img" viewBox="0 0 124 74">
      {children}
    </svg>
  );
}

/**
 * Pinarello Prince: white aero frame with a near-level top tube, a down tube
 * bowed to follow the front wheel, and one smooth Onda wave on both the fork
 * and the dropped wishbone seatstays. Deep wheels, pink tape.
 */
export function PrinceBike() {
  return (
    <Illustration label="White Pinarello Prince road bike">
      <AeroWheel cx={REAR.x} cy={REAR.y} />
      <AeroWheel cx={FRONT.x} cy={FRONT.y} />
      <Frame
        className="strava__bikePaint strava__bikePaint--white"
        d="M27 50L54.6 54.9M54.6 54.9Q67.6 39.2 83.5 26.3M54.6 54.9L44.3 19.5L80.9 17.8L83.5 26.3M46.5 27.3C37 32.2 36.5 45.1 27 50M83.5 26.3C90.5 32.6 88.1 43.7 95 50"
      />
      <path className="strava__bikeStem" d="M80.9 17.8L80 14.9L87.5 13.8" />
      <Frame
        className="strava__bikeTape strava__bikeTape--pink"
        d="M87.5 13.8C93.5 12.8 96.5 14.8 95.5 19.8C94.5 24.8 91.5 26.8 87.5 25.8"
      />
      <path className="strava__bikeStem" d="M44.3 19.5L42 11.8" />
      <path
        className="strava__bikeSaddle"
        d="M35 11.3C39 9.8 46 9.8 50 11.3C46 12.8 39 12.8 35 11.3Z"
      />
      <circle className="strava__bikeChainring" cx={54.6} cy={54.9} r={5.5} />
      <path className="strava__bikeStem" d="M54.6 54.9L58.6 61.9" />
    </Illustration>
  );
}

/**
 * Santa Cruz Stigmata: black gravel frame with a sloping top tube, tall head
 * tube, slim dropped seatstays, and a straight fork. Knobby tires, black tape.
 */
export function CruzBike() {
  return (
    <Illustration label="Black Santa Cruz Stigmata gravel bike">
      <GravelWheel cx={REAR.x} cy={REAR.y} />
      <GravelWheel cx={FRONT.x} cy={FRONT.y} />
      <Frame
        className="strava__bikePaint strava__bikePaint--black"
        d="M27 50L54.1 54.9L82.7 25.2M54.1 54.9L45.6 25.1L80 18L82.7 25.2M47.3 31.1L27 50M82.7 25.2L95 50"
      />
      <path className="strava__bikeShine" d="M48.9 23.7L76.4 18M59.3 48.5L77.9 29.2" />
      <path className="strava__bikeStem" d="M80 18L79 15.2L83.4 14.5" />
      <path
        className="strava__bikeTape strava__bikeTape--black"
        d="M83.4 14.5C89.4 13.5 92.4 15.5 91.4 20.5C90.4 25.5 87.4 27.5 83.4 26.5"
      />
      <path className="strava__bikeShine" d="M87.9 16C89.9 17.5 90 21 88.4 23.5" />
      <path className="strava__bikeStem" d="M45.6 25.1L41.6 11.4" />
      <path
        className="strava__bikeSaddle"
        d="M34.5 10.8C38.5 9.3 45.5 9.3 49.5 10.8C45.5 12.3 38.5 12.3 34.5 10.8Z"
      />
      <circle className="strava__bikeChainring" cx={54.1} cy={54.9} r={5.5} />
      <path className="strava__bikeStem" d="M54.1 54.9L58.1 61.9" />
    </Illustration>
  );
}

/** The drawing for a bike by its Strava name, or nothing for a bike without one. */
export function BikeIllustration({ name }: { name: string }) {
  const key = name.trim().toLowerCase();
  if (key.includes('prince')) {
    return <PrinceBike />;
  }
  if (key.includes('cruz') || key.includes('stigmata')) {
    return <CruzBike />;
  }
  return null;
}

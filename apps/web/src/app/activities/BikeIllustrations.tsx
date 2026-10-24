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

/** Pinarello Prince: white aero frame, wavy Onda fork and stays, deep wheels, pink tape. */
export function PrinceBike() {
  return (
    <Illustration label="White Pinarello Prince road bike">
      <AeroWheel cx={REAR.x} cy={REAR.y} />
      <AeroWheel cx={FRONT.x} cy={FRONT.y} />
      <Frame
        className="strava__bikePaint strava__bikePaint--white"
        d="M27 50L57 52L84 27M57 52L49 20L83 18L84 27M49 21C44 28 37 34 41 40C43 44 33 46 27 50M84 27C90 32 85 38 90 43C92 45 94 47 95 50"
      />
      <path className="strava__bikeStem" d="M83 18L83 14L91 12" />
      <Frame
        className="strava__bikeTape strava__bikeTape--pink"
        d="M91 12C97 11 100 13 99 18C98 23 95 25 91 24"
      />
      <path className="strava__bikeStem" d="M49 20L47 13" />
      <path className="strava__bikeSaddle" d="M39 12.5C43 11 50 11 55 12.5C51 14 44 14 39 12.5Z" />
      <circle className="strava__bikeChainring" cx={57} cy={52} r={5.5} />
      <path className="strava__bikeStem" d="M57 52L61 59" />
    </Illustration>
  );
}

/** Santa Cruz Stigmata: black gravel frame, straight fork, knobby tires, black tape. */
export function CruzBike() {
  return (
    <Illustration label="Black Santa Cruz Stigmata gravel bike">
      <GravelWheel cx={REAR.x} cy={REAR.y} />
      <GravelWheel cx={FRONT.x} cy={FRONT.y} />
      <Frame
        className="strava__bikePaint strava__bikePaint--black"
        d="M27 50L57 52L84 26M57 52L50 21L83 20L84 26M50 23L27 50M84 26L95 50"
      />
      <path className="strava__bikeShine" d="M54 21.5L80 20.6M60 47L80 29.5" />
      <path className="strava__bikeStem" d="M83 20L83 15L91 13" />
      <path
        className="strava__bikeTape strava__bikeTape--black"
        d="M91 13C97 12 100 14 99 19C98 24 95 26 91 25"
      />
      <path className="strava__bikeShine" d="M95.5 14.5C97.5 16 97.6 19.5 96 22" />
      <path className="strava__bikeStem" d="M50 21L48 14" />
      <path className="strava__bikeSaddle" d="M40 13.5C44 12 51 12 56 13.5C52 15 45 15 40 13.5Z" />
      <circle className="strava__bikeChainring" cx={57} cy={52} r={5.5} />
      <path className="strava__bikeStem" d="M57 52L61 59" />
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

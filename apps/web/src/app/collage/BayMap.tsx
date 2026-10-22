import { bayBase, type PlacedLabel, placeLabels } from '@dg/maps/bay/bayAtlas';
import type { MercatorFrame } from '@dg/maps/bay/mercatorFrame';
import { type CSSProperties, type ReactNode, useId } from 'react';
import { cx } from './paperVars';

/** One wash per contour level, outermost first, matching `bayBase().hills`. */
const HILL_WASHES = ['foot', 'slope', 'shoulder', 'crest'] as const;

type BayMapProps = {
  className?: string;
  frame: MercatorFrame;
  /** Path data for one route drawn over the others, which go quiet. */
  highlight?: string | null;
  labels?: boolean;
  /** Route paths in the frame's pixels, inked by their `data-sport`. */
  routes?: ReactNode;
  title: string;
};

function Label({ anchor, dx, dy, kind, rotate, size, text, x, y }: PlacedLabel) {
  const [tx, ty] = [x + dx, y + dy];
  return (
    <g className={`bayMap__label bayMap__label--${kind} bayMap__label--${size}`}>
      {kind === 'peak' ? <circle className="bayMap__pip" cx={x} cy={y} r={3.6} /> : null}
      <text
        textAnchor={anchor}
        transform={rotate === 0 ? undefined : `rotate(${rotate} ${tx} ${ty})`}
        x={tx}
        y={ty}
      >
        {text}
      </text>
    </g>
  );
}

/**
 * The Bay painted in watercolor: pooled shorelines, washed land, hill
 * blooms, bridges, and glowing route ink. Pure SVG, so it costs no tiles.
 * Pigments come from bayMap.css and follow the page's color scheme.
 */
export function BayMap({
  className,
  frame,
  highlight,
  labels = false,
  routes,
  title,
}: BayMapProps) {
  const id = useId();
  const url = (name: string) => `url(#${id}${name})`;
  const coast = `#${id}coast`;
  const base = bayBase(frame);
  const sizes: CSSProperties & Record<`--${string}`, string> = {
    '--bay-bridge': `${base.bridgeWidth.toFixed(1)}px`,
    '--bay-pool': `${(base.kmPx * 1.1).toFixed(1)}px`,
  };
  return (
    <svg
      aria-label={title}
      className={cx('bayMap', highlight && 'bayMap--focused', className)}
      role="img"
      style={sizes}
      viewBox={`0 0 ${frame.width} ${frame.height}`}
    >
      <defs>
        <filter height="110%" id={`${id}wash`} width="110%" x="-5%" y="-5%">
          <feTurbulence
            baseFrequency="0.018"
            numOctaves={4}
            result="n"
            seed={4}
            type="fractalNoise"
          />
          <feDisplacementMap in="SourceGraphic" in2="n" result="d" scale={8} />
          <feGaussianBlur in="d" stdDeviation={0.7} />
        </filter>
        <filter height="120%" id={`${id}bloom`} width="120%" x="-10%" y="-10%">
          <feTurbulence
            baseFrequency="0.028"
            numOctaves={3}
            result="n"
            seed={9}
            type="fractalNoise"
          />
          <feDisplacementMap in="SourceGraphic" in2="n" result="d" scale={18} />
          <feGaussianBlur in="d" stdDeviation={2.2} />
        </filter>
        <filter id={`${id}mottle`}>
          <feTurbulence
            baseFrequency="0.008 0.013"
            numOctaves={4}
            result="n"
            seed={12}
            type="fractalNoise"
          />
          <feColorMatrix
            in="n"
            result="m"
            type="matrix"
            values="0 0 0 0 0.1  0 0 0 0 0.2  0 0 0 0 0.42  0 0 0 1.7 -0.6"
          />
          <feComposite in="m" in2="SourceGraphic" operator="in" />
        </filter>
        <filter id={`${id}grain`}>
          <feTurbulence
            baseFrequency="0.9"
            numOctaves={2}
            result="n"
            seed={2}
            type="fractalNoise"
          />
          <feColorMatrix
            in="n"
            result="g"
            type="matrix"
            values="0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.12  0 0 0 2.2 -1.25"
          />
          <feComposite in="g" in2="SourceGraphic" operator="in" />
        </filter>
        <filter height="110%" id={`${id}blot`} width="110%" x="-5%" y="-5%">
          <feTurbulence
            baseFrequency="0.006"
            numOctaves={3}
            result="n"
            seed={21}
            type="fractalNoise"
          />
          <feColorMatrix
            in="n"
            result="m"
            type="matrix"
            values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 3 -1.55"
          />
          <feComposite in="SourceGraphic" in2="m" operator="in" />
        </filter>
        <filter height="110%" id={`${id}pool`} width="110%" x="-5%" y="-5%">
          <feGaussianBlur stdDeviation={(base.kmPx * 0.35).toFixed(1)} />
        </filter>
        <filter height="110%" id={`${id}soft`} width="110%" x="-5%" y="-5%">
          <feGaussianBlur stdDeviation={2.4} />
        </filter>
        <path d={base.land} id={`${id}coast`} />
        <clipPath id={`${id}land`}>
          <use href={coast} />
        </clipPath>
        <mask id={`${id}sea`}>
          <rect fill="#fff" height="100%" width="100%" />
          <use fill="#000" href={coast} />
        </mask>
      </defs>
      <rect className="bayMap__water" height="100%" width="100%" />
      <rect className="bayMap__mottle" filter={url('mottle')} height="100%" width="100%" />
      <g mask={url('sea')}>
        <use className="bayMap__pool" filter={url('pool')} href={coast} />
      </g>
      <use className="bayMap__land" filter={url('wash')} href={coast} />
      <g clipPath={url('land')}>
        <rect className="bayMap__blush" filter={url('blot')} height="100%" width="100%" />
        {HILL_WASHES.map((wash, level) => (
          <path
            className={`bayMap__hill bayMap__hill--${wash}`}
            d={base.hills[level]}
            filter={url('bloom')}
            key={wash}
          />
        ))}
        <path className="bayMap__park" d={base.parks} filter={url('bloom')} />
        <path className="bayMap__lake" d={base.lakes} filter={url('wash')} />
        <use className="bayMap__rim" filter={url('soft')} href={coast} />
        <rect className="bayMap__grain" filter={url('grain')} height="100%" width="100%" />
      </g>
      <use className="bayMap__shore" filter={url('wash')} href={coast} />
      <g className="bayMap__bridges">
        <path className="bayMap__bridgeHalo" d={base.bridges + base.goldenGate} />
        <path className="bayMap__bridge" d={base.bridges} />
        <path className="bayMap__goldenGate" d={base.goldenGate} />
        <path className="bayMap__tower" d={base.goldenGateTowers} />
      </g>
      <g className="bayMap__ink">{routes}</g>
      {highlight ? (
        <g className="bayMap__highlight">
          <path className="bayMap__casing" d={highlight} />
          <path className="bayMap__focus" d={highlight} />
        </g>
      ) : null}
      {labels ? placeLabels(frame).map((label) => <Label key={label.text} {...label} />) : null}
    </svg>
  );
}

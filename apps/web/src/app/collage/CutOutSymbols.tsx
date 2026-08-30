import styles from './cutOut.module.css';
import { CUT_OUT_SHAPE_NAMES, CUT_OUT_SHAPES, cutOutSymbolId } from './cutOutShapes';

export const COLLAGE_PEBBLE_CLIP_ID = 'collage-pebble-clip';
export const COLLAGE_DISC_CLIP_ID = 'collage-disc-clip';
export const COLLAGE_ROUGH_FILTER_ID = 'collage-rough';
export const COLLAGE_DUO_FILTER_ID = 'collage-duo';

const DUO_TABLE = '0 .08 .16 .26 .38 .52 .68 .85 1';

export function CutOutSymbols() {
  return (
    <svg aria-hidden="true" className={styles.symbols} focusable="false" height="0" width="0">
      <defs>
        <clipPath clipPathUnits="objectBoundingBox" id={COLLAGE_PEBBLE_CLIP_ID}>
          <path d="M0.3978 0.0027L0.3577 0.0054 0.2993 0.0216L0.2372 0.0378 0.2007 0.0649C0.1788 0.0811 0.1496 0.1054 0.1314 0.1189L0.1022 0.1459 0.0766 0.2027C0.0365 0.2865 0.0182 0.3324 0.0146 0.3622C0.0036 0.4189 0.0000 0.5243 0.0000 0.5622L0.0036 0.6000 0.0255 0.6703L0.0511 0.7405 0.0839 0.7838L0.1168 0.8270 0.1861 0.8811L0.2555 0.9324 0.3431 0.9649L0.4270 0.9946 0.5255 0.9973L0.6204 1.0000 0.6642 0.9892C0.7190 0.9730 0.7372 0.9676 0.8175 0.9243L0.8869 0.8865 0.9307 0.8324L0.9708 0.7784 0.9781 0.7405C0.9854 0.7216 0.9891 0.6892 0.9927 0.6703L1.0000 0.6351 0.9927 0.5649C0.9891 0.5270 0.9854 0.4784 0.9818 0.4568L0.9781 0.4162 0.9489 0.3432L0.9161 0.2703 0.8650 0.2081L0.8139 0.1459 0.7883 0.1270C0.7737 0.1189 0.7409 0.0973 0.7153 0.0811L0.6715 0.0514 0.6496 0.0432C0.6350 0.0378 0.5985 0.0270 0.5693 0.0162L0.5109 0.0000 0.4745 0.0000C0.4526 0.0000 0.4197 0.0027 0.3978 0.0027" />
        </clipPath>
        <clipPath clipPathUnits="objectBoundingBox" id={COLLAGE_DISC_CLIP_ID}>
          <path d="M0.3842 0.0192C0.2507 0.0521 0.1580 0.1205 0.0899 0.2301L0.0599 0.2795 0.0436 0.3260C0.0000 0.4685 0.0000 0.5315 0.0463 0.6822C0.0736 0.7644 0.1090 0.8110 0.2071 0.8959L0.2480 0.9315 0.2834 0.9452C0.3297 0.9671 0.3815 0.9808 0.4387 0.9918L0.4877 1.0000 0.5450 0.9945L0.6022 0.9890 0.6649 0.9671L0.7275 0.9452 0.7575 0.9260C0.8965 0.8329 0.9673 0.7178 0.9918 0.5452L1.0000 0.4932 0.9918 0.4411C0.9591 0.2521 0.8692 0.1233 0.7139 0.0466L0.6839 0.0301 0.6076 0.0137C0.5640 0.0055 0.5150 0.0000 0.4959 0.0000L0.4632 0.0000 0.3842 0.0192" />
        </clipPath>
        <filter
          colorInterpolationFilters="sRGB"
          height="112%"
          id={COLLAGE_ROUGH_FILTER_ID}
          width="108%"
          x="-4%"
          y="-6%"
        >
          <feTurbulence baseFrequency=".04" numOctaves={2} seed={7} type="fractalNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            scale={3}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter colorInterpolationFilters="sRGB" id={COLLAGE_DUO_FILTER_ID}>
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR tableValues={DUO_TABLE} type="table" />
            <feFuncG tableValues={DUO_TABLE} type="table" />
            <feFuncB tableValues={DUO_TABLE} type="table" />
          </feComponentTransfer>
        </filter>
      </defs>
      {CUT_OUT_SHAPE_NAMES.map((shape) => (
        <symbol id={cutOutSymbolId(shape)} key={shape} viewBox="0 0 400 400">
          <path d={CUT_OUT_SHAPES[shape]} />
        </symbol>
      ))}
    </svg>
  );
}

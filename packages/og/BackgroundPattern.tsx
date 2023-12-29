import { COLORS } from 'ui/theme/color';

/**
 * Creates a fun SVG background pattern.
 */
export function BackgroundPattern() {
  return (
    <svg
      fill={COLORS.DARK.DEFAULT_BACKGROUND}
      height="630"
      preserveAspectRatio="none"
      stroke={COLORS.DARK.CARD_BACKGROUND}
      strokeWidth={4}
      style={{ position: 'absolute' }}
      viewBox="0 0 1200 630"
      width="1200"
    >
      <rect fill="#001220" height="630" width="1200" x="0" y="0" />
      <defs>
        <linearGradient id="grad1_0" x1="33.3%" x2="100%" y1="100%" y2="0%">
          <stop offset="20%" stopColor="#16ac7f" stopOpacity="1" />
          <stop offset="80%" stopColor="#16ac7f" stopOpacity="1" />
        </linearGradient>
      </defs>
      <defs>
        <linearGradient id="grad1_1" x1="33.3%" x2="100%" y1="100%" y2="0%">
          <stop offset="20%" stopColor="#16ac7f" stopOpacity="1" />
          <stop offset="80%" stopColor="#005b69" stopOpacity="1" />
        </linearGradient>
      </defs>
      <defs>
        <linearGradient id="grad1_2" x1="33.3%" x2="100%" y1="100%" y2="0%">
          <stop offset="20%" stopColor="#001220" stopOpacity="1" />
          <stop offset="80%" stopColor="#005b69" stopOpacity="1" />
        </linearGradient>
      </defs>
      <defs>
        <linearGradient id="grad2_0" x1="0%" x2="66.7%" y1="100%" y2="0%">
          <stop offset="20%" stopColor="#16ac7f" stopOpacity="1" />
          <stop offset="80%" stopColor="#16ac7f" stopOpacity="1" />
        </linearGradient>
      </defs>
      <defs>
        <linearGradient id="grad2_1" x1="0%" x2="66.7%" y1="100%" y2="0%">
          <stop offset="20%" stopColor="#005b69" stopOpacity="1" />
          <stop offset="80%" stopColor="#16ac7f" stopOpacity="1" />
        </linearGradient>
      </defs>
      <defs>
        <linearGradient id="grad2_2" x1="0%" x2="66.7%" y1="100%" y2="0%">
          <stop offset="20%" stopColor="#005b69" stopOpacity="1" />
          <stop offset="80%" stopColor="#001220" stopOpacity="1" />
        </linearGradient>
      </defs>
      <g transform="translate(1200, 630)">
        <path
          d="M-405.6 0C-402.7 -55.1 -399.8 -110.2 -374.7 -155.2C-349.7 -200.2 -302.7 -235.1 -258.8 -258.8C-214.9 -282.5 -174.2 -295.2 -131.6 -317.8C-89 -340.4 -44.5 -373 0 -405.6L0 0Z"
          fill="#003448"
        />
        <path
          d="M-270.4 0C-268.5 -36.7 -266.5 -73.5 -249.8 -103.5C-233.2 -133.5 -201.8 -156.7 -172.5 -172.5C-143.3 -188.4 -116.2 -196.8 -87.8 -211.9C-59.4 -227 -29.7 -248.7 0 -270.4L0 0Z"
          fill="#00837c"
        />
        <path
          d="M-135.2 0C-134.2 -18.4 -133.3 -36.7 -124.9 -51.7C-116.6 -66.7 -100.9 -78.4 -86.3 -86.3C-71.6 -94.2 -58.1 -98.4 -43.9 -105.9C-29.7 -113.5 -14.8 -124.3 0 -135.2L0 0Z"
          fill="#16ac7f"
        />
      </g>
      <g transform="translate(0, 0)">
        <path
          d="M405.6 0C382.6 47.7 359.6 95.4 338.1 140.1C316.7 184.7 296.8 226.2 268 268C239.2 309.8 201.4 351.8 155.2 374.7C109.1 397.7 54.5 401.7 0 405.6L0 0Z"
          fill="#003448"
        />
        <path
          d="M270.4 0C255.1 31.8 239.7 63.6 225.4 93.4C211.1 123.1 197.9 150.8 178.7 178.7C159.4 206.5 134.3 234.5 103.5 249.8C72.7 265.2 36.4 267.8 0 270.4L0 0Z"
          fill="#00837c"
        />
        <path
          d="M135.2 0C127.5 15.9 119.9 31.8 112.7 46.7C105.6 61.6 98.9 75.4 89.3 89.3C79.7 103.3 67.1 117.3 51.7 124.9C36.4 132.6 18.2 133.9 0 135.2L0 0Z"
          fill="#16ac7f"
        />
      </g>
    </svg>
  );
}

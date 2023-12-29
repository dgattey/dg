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
      <defs>
        <pattern
          height="65"
          id="a"
          patternTransform="scale(3) rotate(20)"
          patternUnits="userSpaceOnUse"
          width="65"
        >
          <rect fill="hsla(206, 29%, 9%, 1)" height="100%" width="100%" x="0" y="0" />
          <path
            d="M25.5 6.5a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm39 13a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm0 13a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm-39 0a6 6 0 1 1-12 0 6 6 0 0 1 12 0zm13 26a6 6 0 1 1-12 0 6 6 0 0 1 12 0z"
            fill="hsla(200, 72%, 39%, 1)"
            stroke="none"
            strokeWidth="1"
          />
          <path
            d="M64.5 45.5a6 6 0 1 1-12 0 6 6 0 0 1 12 0zm0-39a6 6 0 1 1-12 0 6 6 0 0 1 12 0zm-13 13a6 6 0 1 1-12 0 6 6 0 0 1 12 0zm0 26a6 6 0 1 1-12 0 6 6 0 0 1 12 0zm-26 13a6 6 0 1 1-12 0 6 6 0 0 1 12 0z"
            fill="hsla(206, 25%, 18%, 1)"
            stroke="none"
            strokeWidth="1"
          />
          <path
            d="M51.5 32.5a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm-13-13a6 6 0 1 1-12 0 6 6 0 0 1 12 0zm0-13a6 6 0 1 1-12 0 6 6 0 0 1 12 0zm-26 39a6 6 0 1 1-12 0 6 6 0 0 1 12 0zm0 13a6 6 0 1 1-12 0 6 6 0 0 1 12 0z"
            fill="hsla(130, 29%, 57%, 1)"
            stroke="none"
            strokeWidth="1"
          />
          <path
            d="M51.5 58.5a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm-39-52a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm0 26a6 6 0 1 1-12 0 6 6 0 0 1 12 0zm26 13a6 6 0 1 1-12 0 6 6 0 0 1 12 0zm-13-26a6 6 0 1 1-12 0 6 6 0 0 1 12 0z"
            fill="hsla(200, 72%, 39%, 1)"
            stroke="none"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect fill="url(#a)" height="800%" transform="translate(0,0)" width="800%" />
    </svg>
  );
}

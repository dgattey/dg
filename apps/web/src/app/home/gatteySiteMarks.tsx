import type { CSSProperties } from 'react';

const markStyle: CSSProperties = {
  display: 'block',
  height: '100%',
  width: '100%',
};

/**
 * Camera mark for Gattey Photos.
 */
export function PhotosSiteMark() {
  return (
    <svg aria-hidden="true" style={markStyle} viewBox="0 0 32 32">
      <rect fill="#f0a06a" height="22" rx="5" width="26" x="3" y="7" />
      <path
        d="M11 7 L13.2 4.2 A2 2 0 0 1 14.8 3.5 H17.2 A2 2 0 0 1 18.8 4.2 L21 7 Z"
        fill="#e8894a"
      />
      <circle cx="16" cy="18" fill="#fff7ed" r="7.25" />
      <circle cx="16" cy="18" fill="#38bdf8" r="5" />
      <circle cx="16" cy="18" fill="#0f172a" r="2.25" />
      <circle cx="14.4" cy="16.4" fill="#ffffff" fillOpacity="0.85" r="1.1" />
      <circle cx="24.5" cy="11.5" fill="#fde68a" r="1.6" />
    </svg>
  );
}

/**
 * Treemap mark adapted from wmm.gattey.com/icon.svg.
 */
export function WmmSiteMark() {
  return (
    <svg aria-hidden="true" style={markStyle} viewBox="0 0 32 32">
      <rect
        fill="#968954"
        height="24"
        rx="2"
        stroke="#e5e7eb"
        strokeOpacity="0.95"
        strokeWidth="0.75"
        width="10"
        x="4"
        y="4"
      />
      <rect
        fill="#48ada6"
        height="9"
        rx="2"
        stroke="#e5e7eb"
        strokeOpacity="0.95"
        strokeWidth="0.75"
        width="13"
        x="15"
        y="4"
      />
      <rect
        fill="#aa559c"
        height="14"
        rx="2"
        stroke="#e5e7eb"
        strokeOpacity="0.95"
        strokeWidth="0.75"
        width="6"
        x="15"
        y="14"
      />
      <rect
        fill="#70a25d"
        height="14"
        rx="2"
        stroke="#e5e7eb"
        strokeOpacity="0.95"
        strokeWidth="0.75"
        width="6"
        x="22"
        y="14"
      />
    </svg>
  );
}

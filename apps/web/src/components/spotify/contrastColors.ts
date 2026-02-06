/**
 * Returns contrast-aware colors for text and shadows over album gradient backgrounds.
 * When isDark is undefined, returns undefined (no styling override).
 */
export function getContrastColors(isDark?: boolean) {
  if (isDark === undefined) {
    return undefined;
  }

  return {
    primaryColor: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
    primaryShadow: isDark ? '0 1px 3px rgba(0, 0, 0, 0.25)' : '0 1px 3px rgba(255, 255, 255, 0.25)',
    subtitleColor: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
    subtitleShadow: isDark
      ? '0 1px 3px rgba(0, 0, 0, 0.18)'
      : '0 1px 3px rgba(255, 255, 255, 0.18)',
  };
}

/**
 * Fallback color when isDark is undefined (neutral gray)
 */
export const NEUTRAL_PRIMARY_COLOR = 'rgba(128, 128, 128, 0.7)';

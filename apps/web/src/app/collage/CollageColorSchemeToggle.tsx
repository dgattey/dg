'use client';

import { jsOnlyProps } from '@dg/ui/core/JsOnlyStyle';
import { Tooltip } from '@dg/ui/core/Tooltip';
import { useColorScheme } from '@dg/ui/theme/useColorScheme';
import { Moon, Sun } from 'lucide-react';

/**
 * One tap flips between light and dark. Landing on the OS scheme follows the OS
 * again rather than pinning it, so the badge marks exactly when the site
 * overrides the OS. Icon and badge come from CSS on `<html>` and the OS media
 * query, which are right before hydration; the label comes from the hook.
 */
export function CollageColorSchemeToggle() {
  const { scheme, setPreference, systemScheme } = useColorScheme();
  const next = scheme === 'dark' ? 'light' : 'dark';
  const label =
    next === systemScheme
      ? `Switch to ${next} theme, matching your system`
      : `Switch to ${next} theme`;

  return (
    <Tooltip className="chrome__schemeAnchor" title={label}>
      <button
        {...jsOnlyProps}
        aria-label={label}
        className="chrome__schemeToggle"
        onClick={() => setPreference(next === systemScheme ? 'system' : next)}
        type="button"
      >
        <Sun aria-hidden={true} className="chrome__schemeSun" size={20} strokeWidth={2.25} />
        <Moon aria-hidden={true} className="chrome__schemeMoon" size={20} strokeWidth={2.25} />
        <span aria-hidden={true} className="chrome__schemeBadge" />
      </button>
    </Tooltip>
  );
}

'use client';

import { jsOnlyProps } from '@dg/ui/core/JsOnlyStyle';
import { type ColorSchemePreference, parseColorSchemePreference } from '@dg/ui/theme/colorScheme';
import { useColorScheme } from '@dg/ui/theme/useColorScheme';
import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Sun } from 'lucide-react';
import chrome from './chrome.classes';
import { PaperCard } from './PaperCard';

const OPTIONS = [
  { Icon: Sun, label: 'Light', value: 'light' },
  { Icon: Moon, label: 'Dark', value: 'dark' },
  { Icon: Monitor, label: 'Match system', value: 'system' },
] as const satisfies ReadonlyArray<{
  Icon: LucideIcon;
  label: string;
  value: ColorSchemePreference;
}>;

/** Segmented sun / moon / system switch on one paper strip, backed by native radios. */
export function CollageColorSchemeFieldset() {
  const { preference, setPreference } = useColorScheme();

  return (
    <fieldset className={chrome.scheme} {...jsOnlyProps}>
      <legend className={chrome.srOnly}>Color scheme</legend>
      <PaperCard edge="quad-c" innerClassName={chrome.schemeTrack} tiltDeg={1.5} tone="black">
        {OPTIONS.map(({ Icon, label, value }) => (
          <label className={chrome.schemeOption} key={value} title={label}>
            <input
              aria-label={label}
              checked={value === preference}
              className={chrome.srOnly}
              name="collage-color-scheme"
              onChange={() => setPreference(parseColorSchemePreference(value))}
              type="radio"
              value={value}
            />
            <Icon aria-hidden={true} size={18} strokeWidth={2.25} />
          </label>
        ))}
      </PaperCard>
    </fieldset>
  );
}

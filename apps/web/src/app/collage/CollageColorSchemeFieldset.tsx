'use client';

import { jsOnlyProps } from '@dg/ui/core/JsOnlyStyle';
import { type ColorSchemePreference, parseColorSchemePreference } from '@dg/ui/theme/colorScheme';
import { useColorScheme } from '@dg/ui/theme/useColorScheme';
import chrome from './chrome.module.css';
import { PaperButton } from './PaperButton';

const OPTIONS = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'Auto', value: 'system' },
] as const satisfies ReadonlyArray<{ label: string; value: ColorSchemePreference }>;

export function CollageColorSchemeFieldset() {
  const { preference, setPreference } = useColorScheme();

  return (
    <fieldset aria-label="Colour scheme" className={chrome.scheme} {...jsOnlyProps}>
      {OPTIONS.map((option, index) => (
        <PaperButton
          current={option.value === preference}
          edge={index === 1 ? 'quad-a' : 'quad-c'}
          key={option.value}
          onClick={() => setPreference(parseColorSchemePreference(option.value))}
          tiltDeg={index === 0 ? -2 : index === 2 ? 2 : 1}
        >
          {option.label}
        </PaperButton>
      ))}
    </fieldset>
  );
}

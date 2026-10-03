import type { CSSProperties } from 'react';
import { cx } from './paperVars';

const LETTER_TREATMENTS = [
  { offsetEm: 0, rotationDeg: -2 },
  { offsetEm: 0.02, rotationDeg: 1 },
  { offsetEm: -0.015, rotationDeg: -1.5 },
  { offsetEm: 0.015, rotationDeg: 2 },
  { offsetEm: -0.015, rotationDeg: -1.5 },
  { offsetEm: 0.01, rotationDeg: 1 },
  { offsetEm: 0.02, rotationDeg: -2 },
  { offsetEm: -0.01, rotationDeg: 1.5 },
  { offsetEm: 0.015, rotationDeg: -1 },
  { offsetEm: -0.015, rotationDeg: 2 },
  { offsetEm: 0, rotationDeg: -3 },
] as const;

/**
 * Collage page title. `cut` scatters each letter like a ransom-note cutout, which only
 * reads well on short codes (404, 500); long titles stay as set type.
 */
export function CutLetters({
  className,
  cut = false,
  text,
}: {
  className?: string;
  cut?: boolean;
  text: string;
}) {
  const words = Array.from(text.trim().matchAll(/\S+/g));
  let treatmentIndex = 0;

  if (!cut) {
    return (
      <h1 className={cx('cutHeading', className)}>
        {words.map((wordMatch, wordIndex) => (
          <span
            className={cx('cutWord', wordIndex > 0 && 'cutIndentedWord')}
            key={`${wordMatch.index}-${wordMatch[0]}`}
          >
            {wordMatch[0]}
            {wordIndex < words.length - 1 ? ' ' : null}
          </span>
        ))}
      </h1>
    );
  }

  return (
    <h1 aria-label={text} className={cx('cutHeading', 'cutHeadingCut', className)}>
      {words.map((wordMatch, wordIndex) => {
        const word = wordMatch[0];
        const wordOffset = wordMatch.index;
        return (
          <span
            aria-hidden="true"
            className={cx('cutWord', wordIndex > 0 && 'cutIndentedWord')}
            key={`${wordOffset}-${word}`}
          >
            {Array.from(word.matchAll(/./gu)).map((letterMatch) => {
              const letter = letterMatch[0];
              const treatment =
                LETTER_TREATMENTS[treatmentIndex % LETTER_TREATMENTS.length] ??
                LETTER_TREATMENTS[0];
              treatmentIndex += 1;
              const style: CSSProperties = {
                rotate: `${treatment.rotationDeg}deg`,
                translate: `0 ${treatment.offsetEm}em`,
              };
              return (
                <span
                  className="cutLetter"
                  key={`${wordOffset + letterMatch.index}-${letter}`}
                  style={style}
                >
                  {letter}
                </span>
              );
            })}
            {wordIndex < words.length - 1 ? ' ' : null}
          </span>
        );
      })}
    </h1>
  );
}

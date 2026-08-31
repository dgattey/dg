import type { CSSProperties } from 'react';
import { cx } from './paperVars';

const LETTER_TREATMENTS = [
  { accent: false, offsetEm: 0, rotationDeg: -2 },
  { accent: false, offsetEm: 0.02, rotationDeg: 1 },
  { accent: true, offsetEm: -0.015, rotationDeg: -1.5 },
  { accent: true, offsetEm: 0.015, rotationDeg: 2 },
  { accent: false, offsetEm: -0.015, rotationDeg: -1.5 },
  { accent: false, offsetEm: 0.01, rotationDeg: 1 },
  { accent: true, offsetEm: 0.02, rotationDeg: -2 },
  { accent: false, offsetEm: -0.01, rotationDeg: 1.5 },
  { accent: false, offsetEm: 0.015, rotationDeg: -1 },
  { accent: false, offsetEm: -0.015, rotationDeg: 2 },
  { accent: true, offsetEm: 0, rotationDeg: -3 },
] as const;

export function CutLetters({ className, text }: { className?: string; text: string }) {
  const words = Array.from(text.trim().matchAll(/\S+/g));
  let treatmentIndex = 0;

  return (
    <h1 aria-label={text} className={cx('cutHeading', className)}>
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
                  className={cx('cutLetter', treatment.accent && 'cutAccent')}
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

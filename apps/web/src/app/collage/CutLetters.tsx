import type { TypographyVariant } from '@dg/ui/core/Typography';
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

const LINE_INDENTS_EM = [0, 0.56, 0.28, 0.44] as const;

type HeadingLine = {
  offset: number;
  text: string;
};

function splitHeadingLines(text: string): Array<HeadingLine> {
  const trimmed = text.trim();
  if (!trimmed) {
    return [];
  }
  const pattern = trimmed.includes('\n') ? /[^\n]+/g : /\S+/g;
  return Array.from(trimmed.matchAll(pattern), (match) => ({
    offset: match.index,
    text: match[0].trim().replace(/\s+/g, ' '),
  })).filter((line) => line.text.length > 0);
}

/**
 * Collage page title. Multi-word titles stack across staggered lines with a playful
 * horizontal offset on subsequent lines; `cut` scatters each letter like a ransom-note
 * cutout, which only reads well on short codes (404, 500).
 */
export function CutLetters({
  className,
  cut = false,
  text,
  variant = 'display-page',
}: {
  className?: string;
  cut?: boolean;
  text: string;
  variant?: Extract<TypographyVariant, 'display-hero' | 'display-page'>;
}) {
  const lines = splitHeadingLines(text);
  const accessibleLabel = lines.map((line) => line.text).join(' ');
  let treatmentIndex = 0;

  if (!cut) {
    return (
      <h1 className={cx('cutHeading', className)} data-typography={variant}>
        {lines.map((line, lineIndex) => {
          const indentEm = LINE_INDENTS_EM[lineIndex] ?? LINE_INDENTS_EM[1];
          const lineStyle: (CSSProperties & Record<`--${string}`, string>) | undefined =
            lineIndex > 0 ? { '--line-indent': `${indentEm}em` } : undefined;
          return (
            <span
              className={cx('cutWord', lineIndex > 0 && 'cutIndentedLine')}
              key={`${line.offset}-${line.text}`}
              style={lineStyle}
            >
              {line.text}
              {lineIndex < lines.length - 1 ? ' ' : null}
            </span>
          );
        })}
      </h1>
    );
  }

  return (
    <h1
      aria-label={accessibleLabel}
      className={cx('cutHeading', 'cutHeadingCut', className)}
      data-typography="display-cut"
    >
      {lines.map((line, lineIndex) => {
        const indentEm = LINE_INDENTS_EM[lineIndex] ?? LINE_INDENTS_EM[1];
        const lineStyle: (CSSProperties & Record<`--${string}`, string>) | undefined =
          lineIndex > 0 ? { '--line-indent': `${indentEm}em` } : undefined;
        return (
          <span
            aria-hidden="true"
            className={cx('cutWord', lineIndex > 0 && 'cutIndentedLine')}
            key={`${line.offset}-${line.text}`}
            style={lineStyle}
          >
            {Array.from(line.text.matchAll(/./gu)).map((letterMatch) => {
              const letter = letterMatch[0];
              const treatment =
                LETTER_TREATMENTS[treatmentIndex % LETTER_TREATMENTS.length] ??
                LETTER_TREATMENTS[0];
              treatmentIndex += 1;
              const style: CSSProperties & Record<`--${string}`, string> = {
                '--letter-r': `${treatment.rotationDeg}deg`,
                '--letter-y': `${treatment.offsetEm}em`,
              };
              return (
                <span
                  className="cutLetter"
                  key={`${line.offset + letterMatch.index}-${letter}`}
                  style={style}
                >
                  {letter}
                </span>
              );
            })}
            {lineIndex < lines.length - 1 ? ' ' : null}
          </span>
        );
      })}
    </h1>
  );
}

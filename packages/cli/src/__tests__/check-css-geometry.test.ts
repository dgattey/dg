import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { checkGridGapsFit, checkScallopPadding } from '../check-css-geometry.js';

const FILE = 'apps/web/src/app/music/stats/statsShapes.css';

describe('check-css-geometry', () => {
  it('lets only the seal and sticker rules pad a scallop', () => {
    const violations = checkScallopPadding(
      new Map([
        [
          FILE,
          [
            '.stats__scallop--seal { padding: 20%; }',
            '.stats__scallop--sticker { padding: 14%; }',
            '.stats__scallop--seal::before { inset: 9.5%; }',
            '.stats__heroStamp .stats__scallop { padding: 18%; }',
            '.stats__heroStamp { width: 132px; }',
            '@media (max-width: 600px) {',
            '  .x > .stats__scallop--seal { padding-inline: 4px; }',
            '}',
            '.stats__scallop--seal .stats__number { padding: 2px; }',
          ].join('\n'),
        ],
      ]),
    );
    assert.deepEqual(
      violations.map(({ line, rule }) => ({ line, rule })),
      [
        { line: 4, rule: 'css-scallop-padding' },
        { line: 7, rule: 'css-scallop-padding' },
      ],
    );
  });

  it('flags many-column grids whose gaps outgrow a phone unless a media query collapses them', () => {
    const violations = checkGridGapsFit(
      new Map([
        [
          FILE,
          [
            '.wide { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 28px 40px; }',
            '.collapsed { grid-template-columns: repeat(12, minmax(0, 1fr)); column-gap: 40px; }',
            '.tightened { grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 40px; }',
            '.stillWide { grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 40px; }',
            '.narrow { grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 24px; }',
            '.tokens { grid-template-columns: repeat(12, minmax(0, 1fr)); gap: var(--gap); }',
            '@media (max-width: 900px) {',
            '  .collapsed { grid-template-columns: minmax(0, 1fr); }',
            '  .tightened { gap: 18px; }',
            '  .stillWide { grid-template-columns: 28px repeat(12, 1fr); }',
            '}',
          ].join('\n'),
        ],
      ]),
    );
    assert.deepEqual(
      violations.map(({ line, message }) => ({ line, message })),
      [
        {
          line: 1,
          message:
            '12 columns with 40px gaps need 440px, wider than a 288px phone box; collapse the columns in a max-width media query',
        },
        {
          line: 4,
          message:
            '12 columns with 40px gaps need 440px, wider than a 288px phone box; collapse the columns in a max-width media query',
        },
      ],
    );
  });
});

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  checkCardHeadStable,
  checkCornerTagRoom,
  checkGridGapsFit,
  checkHeaderAboveSticky,
  checkHomepageConsistency,
  checkScallopPadding,
} from '../check-css-geometry.js';
import { checkFooterCurtainReveal, checkHeaderLogoAlignment } from '../check-page-titles.js';

const FILE = 'apps/web/src/app/music/stats/statsShapes.css';

describe('check-css-geometry', () => {
  it('lets only the seal and sticker rules pad a scallop and enforces inscribed circular clearance', () => {
    const violations = checkScallopPadding(
      new Map([
        [
          FILE,
          [
            '.stats__scallop--seal { padding: calc(50% - (50% - var(--ring-inset) - 4px) * 0.7071); }',
            '.stats__scallop--sticker { padding: 14%; }',
            '.stats__scallop--seal::before { inset: 9.5%; }',
            '.stats__heroStamp .stats__scallop { padding: 18%; }',
            '.stats__heroStamp { width: 132px; }',
            '@media (max-width: 600px) {',
            '  .x > .stats__scallop--seal { padding-inline: 4px; }',
            '}',
            '.stats__scallop--seal .stats__number { padding: 2px; }',
            '.stats__scallop--seal { padding: calc(var(--ring-inset) + 2px); }',
            '.stats__scallop--sticker { padding: 10%; }',
            '.stats__pocketSeal { width: 152px; }',
            '.stats__scallop--seal .stats__number { font-size: var(--type-title-lg); }',
          ].join('\n'),
        ],
      ]),
    );
    assert.deepEqual(
      violations.map(({ line, rule }) => ({ line, rule })),
      [
        { line: 4, rule: 'css-scallop-padding' },
        { line: 7, rule: 'css-scallop-padding' },
        { line: 10, rule: 'css-scallop-padding' },
        { line: 11, rule: 'css-scallop-padding' },
        { line: 12, rule: 'css-scallop-padding' },
        { line: 13, rule: 'css-scallop-padding' },
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

  it('keeps card heads stacked and their subtitle on one line', () => {
    const stable = checkCardHeadStable(
      new Map([
        [
          FILE,
          [
            '.stats__head { display: grid; gap: 4px; }',
            '.stats__aside { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }',
          ].join('\n'),
        ],
      ]),
    );
    assert.deepEqual(stable, []);

    const violations = checkCardHeadStable(
      new Map([
        [
          FILE,
          [
            '.stats__head { display: flex; flex-wrap: wrap; }',
            '.stats__aside { color: red; }',
            '.stats__genres .stats__aside { white-space: normal; }',
          ].join('\n'),
        ],
      ]),
    );
    assert.deepEqual(
      violations.map(({ line, rule }) => ({ line, rule })),
      [
        { line: 1, rule: 'css-card-head-wrap' },
        { line: 3, rule: 'css-card-head-wrap' },
        { line: 2, rule: 'css-card-head-wrap' },
      ],
    );
  });

  it('keeps the street coverage card head height locked across hovered neighborhoods', () => {
    const streetsFile = 'apps/web/src/app/activities/streetCoverage.css';
    const violations = checkCardHeadStable(
      new Map([
        [
          streetsFile,
          [
            '.streets__cities { flex-shrink: 0; }',
            '.streets__figures { min-width: 0; }',
            '.streets__focusShare, .streets__figures .strava__aside { white-space: nowrap; }',
            '.streets__focusName { min-width: 0; }',
          ].join('\n'),
        ],
      ]),
    );
    assert.deepEqual(
      violations.map(({ line, rule }) => ({ line, rule })),
      [
        { line: 1, rule: 'css-card-head-wrap' },
        { line: 2, rule: 'css-card-head-wrap' },
        { line: 4, rule: 'css-card-head-wrap' },
      ],
    );
  });

  it('makes every tag hung over a card face bounded and padded out of the head', () => {
    const violations = checkCornerTagRoom(
      new Map([
        [
          FILE,
          [
            '.stats__cardSeal { position: absolute; top: -28px; right: 16px; width: 108px; }',
            '.stats__cardStamp { position: absolute; top: -18px; right: 22px; }',
            '.stats__pin { position: absolute; top: -16px; right: 26px; max-width: 120px; }',
            '.stats__sticker { position: absolute; top: -16px; right: -30px; }',
            '.stats__ribbon { position: absolute; top: -22px; right: 30px; z-index: -1; }',
            '.paperWrap:has(> .stats__cardSeal) .stats__head { padding-right: 96px; }',
            '.paperWrap:has(> .stats__cardStamp) .stats__heading { padding-right: 140px; }',
          ].join('\n'),
        ],
      ]),
    );
    assert.deepEqual(
      violations.map(({ line, message }) => ({ line, message })),
      [
        {
          line: 2,
          message:
            'Corner tag `.stats__cardStamp` needs a `width` or `max-width` so card text keeps clear of it',
        },
        {
          line: 3,
          message:
            'Corner tag `.stats__pin` needs a `.paperWrap:has(> .stats__pin)` rule padding the card head so card text keeps clear of it',
        },
      ],
    );
  });

  it('requires .chrome__header to have a higher z-index than any sticky filter or section bar', () => {
    const violations = checkHeaderAboveSticky(
      new Map([
        [
          'apps/web/src/app/collage/chrome.css',
          '.chrome__header { position: sticky; top: 0; z-index: 20; }',
        ],
        [
          FILE,
          [
            '.reading__filters { position: sticky; top: 90px; z-index: 30; }',
            '.stats__toolbar { position: sticky; top: 90px; z-index: 20; }',
            '.reading__sectionHeading { position: sticky; top: 96px; z-index: 5; }',
          ].join('\n'),
        ],
      ]),
    );
    assert.deepEqual(
      violations.map(({ line, rule }) => ({ line, rule })),
      [
        { line: 1, rule: 'css-header-above-sticky' },
        { line: 2, rule: 'css-header-above-sticky' },
      ],
    );
  });

  it('enforces the footer curtain reveal and symmetric padding-block on .chrome__footerGrid', () => {
    const violations = checkFooterCurtainReveal(
      new Map([
        [
          'apps/web/src/app/collage/collage.css',
          '.collageSheet { position: relative; z-index: 2; }',
        ],
        [
          'apps/web/src/app/collage/chrome.css',
          [
            '.chrome__footer { position: sticky; bottom: 0; z-index: 2; }',
            '.chrome__nowWrap { position: relative; z-index: 1; height: 0; }',
            '.chrome__footerGrid { display: grid; }',
          ].join('\n'),
        ],
      ]),
    );
    assert.deepEqual(
      violations.map(({ line, rule }) => ({ line, rule })),
      [
        { line: 1, rule: 'css-footer-curtain' },
        { line: 3, rule: 'css-footer-curtain' },
      ],
    );
  });

  it('enforces header center alignment, zero logo padding, and desktop logo scale', () => {
    const violations = checkHeaderLogoAlignment(
      new Map([
        [
          'apps/web/src/app/collage/chrome.css',
          [
            '.chrome__header { display: flex; align-items: flex-start; }',
            '.chrome__logo { padding: 4px; }',
            '.chrome__logo > svg { height: 44px; }',
            '.chrome__nowPlaying { margin-top: 6px; }',
            '.chrome__nav { margin-top: 8px; }',
          ].join('\n'),
        ],
      ]),
    );
    assert.deepEqual(
      violations.map(({ line, rule }) => ({ line, rule })),
      [
        { line: 1, rule: 'css-header-logo-alignment' },
        { line: 2, rule: 'css-header-logo-alignment' },
        { line: 3, rule: 'css-header-logo-alignment' },
        { line: 4, rule: 'css-header-logo-alignment' },
        { line: 5, rule: 'css-header-logo-alignment' },
      ],
    );
  });

  it('enforces homepage top padding, project frame rounding, and side-project mark concentricity', () => {
    const violations = checkHomepageConsistency(
      new Map([
        [
          'apps/web/src/app/home/home.css',
          [
            '.home__hello { --sp-top: 14px; }',
            '.home__headline { padding-top: 4px; }',
            '.home__frameCard { width: 100%; }',
            '.home__frameShot { border-radius: 3px; }',
            '.home__sideRowWrap { width: 100%; }',
          ].join('\n'),
        ],
        [
          'apps/web/src/app/collage/collage.css',
          '[data-role="side-project-mark"] { background: var(--cream); }',
        ],
      ]),
    );
    assert.deepEqual(
      violations.map(({ line, rule }) => ({ line, rule })),
      [
        { line: 1, rule: 'css-homepage-consistency' },
        { line: 2, rule: 'css-homepage-consistency' },
        { line: 3, rule: 'css-homepage-consistency' },
        { line: 4, rule: 'css-homepage-consistency' },
        { line: 5, rule: 'css-homepage-consistency' },
        { line: 1, rule: 'css-homepage-consistency' },
      ],
    );
  });
});

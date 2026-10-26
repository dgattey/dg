import {
  type CssRule,
  checkFooterCurtainReveal,
  checkHeaderLogoAlignment,
  cssRules,
  declaration,
  lineAt,
} from './check-page-titles.js';
import type { StructureViolation } from './check-structure.js';

/** Narrowest box a page grid gets: a 320px phone minus the 16px page gutters. */
export const NARROWEST_GRID_PX = 288;
const lastCompound = (selector: string): string => selector.split(/[\s>+~]+/).at(-1) ?? '';

function columnGapPx(body: string): number | null | undefined {
  const gap = declaration(body, 'column-gap') ?? declaration(body, 'gap')?.split(/\s+/).at(-1);
  if (gap === undefined) return undefined;
  const px = /^(\d+(?:\.\d+)?)px$/.exec(gap);
  return px ? Number(px[1]) : null;
}

function trackCount(columns: string): number {
  let count = 0;
  const rest = columns.replace(/repeat\(\s*(\d+)\s*,(?:[^()]|\([^()]*\))*\)/g, (_, n: string) => {
    count += Number(n);
    return ' ';
  });
  const tokens = rest.replace(/\([^()]*\)/g, '').split(/\s+/);
  return count + tokens.filter(Boolean).length;
}

type GridOverride = { columns?: string; display?: string; gap: number | null | undefined };

function overrideFits(override: GridOverride, baseColumns: string, baseGap: number): boolean {
  if (override.display && !override.display.includes('grid')) return true;
  if (!override.columns && override.gap === undefined) return false;
  const gap = override.gap === undefined ? baseGap : override.gap;
  const columns = override.columns ?? baseColumns;
  return gap !== null && (trackCount(columns) - 1) * gap <= NARROWEST_GRID_PX;
}

function sealPaddingClearsRing(pad: string): boolean {
  const pct = /^(\d+(?:\.\d+)?)%$/.exec(pad);
  if (pct) return Number(pct[1]) >= 20;
  const [a, b] = [...pad.matchAll(/\*\s*(0\.\d+)/g)].map((m) => Number(m[1]));
  return (
    pad.includes('--ring-inset') &&
    a !== undefined &&
    a <= 0.8 &&
    (b === undefined ? a <= 0.71 : b <= 0.8 && Math.hypot(a, b) <= 1.001)
  );
}

export function checkScallopPadding(
  cssFiles: ReadonlyMap<string, string>,
): Array<StructureViolation> {
  const owners = new Set(['.stats__scallop--seal', '.stats__scallop--sticker']);
  const statSeals = new Set(['.stats__pocketSeal', '.strava__totalClimb', '.streets__seal']);
  const violations: Array<StructureViolation> = [];
  for (const [file, content] of cssFiles) {
    for (const rule of cssRules(content)) {
      const line = lineAt(content, rule.index);
      const flag = (message: string) =>
        violations.push({ file, line, message, rule: 'css-scallop-padding' });
      const pad = declaration(rule.body, 'padding');
      if (rule.selectors.includes('.stats__scallop--seal') && pad && !sealPaddingClearsRing(pad)) {
        flag(
          'Seal padding must clear the inscribed square of the circular ring (use the 0.7071 ring-inset projection or >= 20%), not cardinal ring-inset + 2px',
        );
      }
      const stickerPct = /^(\d+(?:\.\d+)?)%$/.exec(pad ?? '');
      const badSticker =
        rule.selectors.includes('.stats__scallop--sticker') &&
        pad &&
        (!stickerPct || Number(stickerPct[1]) < 14);
      if (badSticker) {
        flag('Sticker padding must be at least 14% to clear the scallop valleys');
      }
      if (!rule.media) {
        for (const selector of rule.selectors.filter((s) => statSeals.has(s))) {
          const px = /(\d+(?:\.\d+)?)px/.exec(declaration(rule.body, 'width') ?? '');
          if (px && Number(px[1]) < 184) {
            flag(`Stat seal \`${selector}\` needs >= 184px width (${px[1]}px given)`);
          }
        }
      }
      const isScallop = rule.selectors.some((s) => /\.stats__scallop/.test(s));
      if (isScallop && /--type-(?:title-lg|display|h1)\b/.test(rule.body)) {
        flag('Seal and sticker text must use --type-title-md or smaller');
      }
      const scallop = rule.selectors.some(
        (s) => !owners.has(s) && /\.stats__scallop(?![\w-]*::?)/.test(lastCompound(s)),
      );
      if (scallop && /(?:^|[;\s])padding(?:-[a-z]+)?\s*:/.test(rule.body)) {
        flag('Size the seal or sticker instead of overriding scallop padding');
      }
    }
  }
  return violations;
}

const STREETS_HEAD_PROPS = [
  ['.streets__cities', 'flex-shrink', '0'],
  ['.streets__cities', 'flex-wrap', 'nowrap'],
  ['.streets__figures', 'min-width', '0'],
  ['.streets__figures', 'max-width', '100%'],
  ['.streets__focusName', 'min-width', '0'],
  ['.streets__focusName', 'white-space', 'nowrap'],
  ['.streets__focusShare', 'white-space', 'nowrap'],
  ['.streets__figures .strava__aside', 'white-space', 'nowrap'],
] as const;

export function checkCardHeadStable(
  cssFiles: ReadonlyMap<string, string>,
): Array<StructureViolation> {
  const violations: Array<StructureViolation> = [];
  for (const [file, content] of cssFiles) {
    const flag = (index: number, message: string) =>
      violations.push({ file, line: lineAt(content, index), message, rule: 'css-card-head-wrap' });
    let asideBase: CssRule | undefined;
    let asideFirst: CssRule | undefined;
    for (const rule of cssRules(content)) {
      const compounds = rule.selectors.map(lastCompound);
      if (
        compounds.includes('.stats__head') &&
        declaration(rule.body, 'flex-wrap')?.startsWith('wrap')
      ) {
        flag(
          rule.index,
          'Stack the card title over its subtitle instead of wrapping, so a hover readout never changes the head height',
        );
      }
      if (!compounds.includes('.stats__aside')) continue;
      asideFirst ??= rule;
      const whiteSpace = declaration(rule.body, 'white-space');
      if (
        !rule.media &&
        rule.selectors.includes('.stats__aside') &&
        whiteSpace === 'nowrap' &&
        declaration(rule.body, 'text-overflow') === 'ellipsis'
      ) {
        asideBase = rule;
      } else if (whiteSpace && whiteSpace !== 'nowrap') {
        flag(rule.index, 'Keep the card subtitle on one line, since it doubles as a hover readout');
      }
    }
    if (asideFirst && !asideBase) {
      flag(
        asideFirst.index,
        '`.stats__aside` needs `white-space: nowrap` and `text-overflow: ellipsis` so a hover readout stays one line',
      );
    }
  }
  const streetsFile = 'apps/web/src/app/activities/streetCoverage.css';
  const streetsCss = cssFiles.get(streetsFile);
  if (streetsCss) {
    const baseRules = cssRules(streetsCss).filter((r) => !r.media);
    for (const [sel, prop, val] of STREETS_HEAD_PROPS) {
      const matches = baseRules.filter((r) => r.selectors.includes(sel));
      if (!matches.some((r) => declaration(r.body, prop) === val)) {
        violations.push({
          file: streetsFile,
          line: lineAt(streetsCss, matches[0]?.index ?? 0),
          message: `\`${sel}\` needs \`${prop}: ${val}\` so hovering a neighborhood never changes the header height`,
          rule: 'css-card-head-wrap',
        });
      }
    }
  }
  return violations;
}

export function checkCornerTagRoom(
  cssFiles: ReadonlyMap<string, string>,
): Array<StructureViolation> {
  const rulesByFile = new Map([...cssFiles].map(([file, content]) => [file, cssRules(content)]));
  const roomFor = new Set<string>();
  for (const rule of [...rulesByFile.values()].flat()) {
    if (!/(?:^|[;\s])padding(?:-right|-inline-end|-inline)?\s*:/.test(rule.body)) continue;
    for (const selector of rule.selectors.filter((s) => /\.stats__head|\.stats__heading/.test(s))) {
      for (const match of selector.matchAll(/:has\(>\s*(\.[\w-]+)\)/g)) {
        if (match[1]) roomFor.add(match[1]);
      }
    }
  }
  const violations: Array<StructureViolation> = [];
  for (const [file, rules] of rulesByFile) {
    for (const rule of rules) {
      const tag = rule.selectors.length === 1 ? rule.selectors[0] : undefined;
      if (!tag || !/^\.[\w-]+$/.test(tag) || rule.media) continue;
      const right = declaration(rule.body, 'right');
      const hangs =
        declaration(rule.body, 'position') === 'absolute' &&
        declaration(rule.body, 'top')?.startsWith('-') &&
        right !== undefined &&
        !right.startsWith('-') &&
        !declaration(rule.body, 'z-index')?.startsWith('-');
      if (!hangs) continue;
      const hasWidth = Boolean(
        declaration(rule.body, 'width') || declaration(rule.body, 'max-width'),
      );
      const problems = [
        hasWidth ? null : 'a `width` or `max-width`',
        roomFor.has(tag) ? null : `a \`.paperWrap:has(> ${tag})\` rule padding the card head`,
      ].filter(Boolean);
      if (problems.length > 0) {
        const line = lineAt(cssFiles.get(file) ?? '', rule.index);
        const message = `Corner tag \`${tag}\` needs ${problems.join(' and ')} so card text keeps clear of it`;
        violations.push({ file, line, message, rule: 'css-corner-tag-room' });
      }
    }
  }
  return violations;
}

export function checkGridGapsFit(cssFiles: ReadonlyMap<string, string>): Array<StructureViolation> {
  const rulesByFile = new Map([...cssFiles].map(([file, content]) => [file, cssRules(content)]));
  const overrides = new Map<string, Array<GridOverride>>();
  for (const rule of [...rulesByFile.values()].flat()) {
    if (!rule.media?.includes('max-width')) continue;
    const override = {
      columns: declaration(rule.body, 'grid-template-columns'),
      display: declaration(rule.body, 'display'),
      gap: columnGapPx(rule.body),
    };
    for (const selector of rule.selectors) {
      overrides.set(selector, [...(overrides.get(selector) ?? []), override]);
    }
  }
  const violations: Array<StructureViolation> = [];
  for (const [file, rules] of rulesByFile) {
    for (const rule of rules) {
      const columns = declaration(rule.body, 'grid-template-columns');
      const gap = columnGapPx(rule.body);
      if (!columns || gap === null || gap === undefined) continue;
      const gapsPx = (trackCount(columns) - 1) * gap;
      const collapses = rule.selectors.every((selector) =>
        (overrides.get(selector) ?? []).some((override) => overrideFits(override, columns, gap)),
      );
      if (gapsPx > NARROWEST_GRID_PX && !collapses) {
        const line = lineAt(cssFiles.get(file) ?? '', rule.index);
        const message = `${trackCount(columns)} columns with ${gap}px gaps need ${gapsPx}px, wider than a ${NARROWEST_GRID_PX}px phone box; collapse the columns in a max-width media query`;
        violations.push({ file, line, message, rule: 'css-grid-gaps-fit' });
      }
    }
  }
  return violations;
}

/** The sticky header must stay above every page-level sticky filter or section bar. */
export function checkHeaderAboveSticky(
  cssFiles: ReadonlyMap<string, string>,
): Array<StructureViolation> {
  const rulesByFile = new Map([...cssFiles].map(([file, content]) => [file, cssRules(content)]));
  const headerZ = [...rulesByFile.values()]
    .flat()
    .find((r) => !r.media && r.selectors.includes('.chrome__header'));
  const maxZ = Number(declaration(headerZ?.body ?? '', 'z-index'));
  if (!Number.isFinite(maxZ)) return [];
  const violations: Array<StructureViolation> = [];
  for (const [file, rules] of rulesByFile) {
    for (const rule of rules) {
      const z = Number(declaration(rule.body, 'z-index'));
      if (
        !rule.selectors.includes('.chrome__header') &&
        declaration(rule.body, 'position') === 'sticky' &&
        Number.isFinite(z) &&
        z >= maxZ
      ) {
        const line = lineAt(cssFiles.get(file) ?? '', rule.index);
        const message = `Sticky rule \`${rule.selectors.join(', ')}\` has z-index ${z}, which must be below \`.chrome__header\` (z-index ${maxZ}) so the header dropdown paints on top`;
        violations.push({ file, line, message, rule: 'css-header-above-sticky' });
      }
    }
  }
  return violations;
}

const RAW_MARK_PROPS = [
  ['background', 'none'],
  ['box-shadow', 'none'],
  ['padding', '0'],
  ['border-radius', '0'],
  ['transform', 'none'],
] as const;

const HOME_RULES: ReadonlyArray<readonly [boolean, string, (b: string) => boolean, string]> = [
  [true, '.home__hello', (b) => declaration(b, '--sp-top') === '40px', 'Set --sp-top: 40px'],
  [true, '.home__headline', (b) => !declaration(b, 'padding-top'), 'Drop padding-top'],
  [
    true,
    '.home__frameCard',
    (b) => Boolean(declaration(b, '--frame-radius')),
    'Set --frame-radius',
  ],
  [
    true,
    '.home__frameShot',
    (b) => declaration(b, 'border-radius') === 'var(--nested-radius)',
    'Use --nested-radius',
  ],
  [true, '.home__sideRowWrap', (b) => Boolean(declaration(b, '--row-radius')), 'Set --row-radius'],
  [
    false,
    '[data-role="side-project-mark"]',
    (b) => RAW_MARK_PROPS.every(([k, v]) => declaration(b, k) === v),
    'Keep side-project marks untouched',
  ],
];

export function checkHomepageConsistency(
  cssFiles: ReadonlyMap<string, string>,
): Array<StructureViolation> {
  const homeFile = 'apps/web/src/app/home/home.css';
  const collageFile = 'apps/web/src/app/collage/collage.css';
  const home = cssFiles.get(homeFile);
  const collage = cssFiles.get(collageFile);
  if (!home || !collage) return [];
  const violations: Array<StructureViolation> = [];
  for (const [isHome, sel, ok, message] of HOME_RULES) {
    const raw = isHome ? home : collage;
    const rule = cssRules(raw).find((r) => !r.media && r.selectors.join(',') === sel);
    if (rule && !ok(rule.body)) {
      const file = isHome ? homeFile : collageFile;
      const line = lineAt(raw, rule.index);
      violations.push({ file, line, message, rule: 'css-homepage-consistency' });
    }
  }
  return violations;
}

export function checkCssGeometry(cssFiles: ReadonlyMap<string, string>): Array<StructureViolation> {
  return [
    ...checkScallopPadding(cssFiles),
    ...checkGridGapsFit(cssFiles),
    ...checkCardHeadStable(cssFiles),
    ...checkCornerTagRoom(cssFiles),
    ...checkHeaderAboveSticky(cssFiles),
    ...checkFooterCurtainReveal(cssFiles),
    ...checkHeaderLogoAlignment(cssFiles),
    ...checkHomepageConsistency(cssFiles),
  ];
}

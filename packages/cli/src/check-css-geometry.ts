import type { StructureViolation } from './check-structure.js';

/** Narrowest box a page grid gets: a 320px phone minus the 16px page gutters. */
export const NARROWEST_GRID_PX = 288;

type CssRule = {
  body: string;
  index: number;
  media: string | null;
  selectors: Array<string>;
};

/** Flat list of style rules, each tagged with the `@media` prelude it sits in. */
function cssRules(content: string): Array<CssRule> {
  const source = content.replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, ' '));
  const rules: Array<CssRule> = [];
  const media: Array<string | null> = [];
  let start = 0;
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (char === '{') {
      const prelude = source.slice(start, i).trim();
      const close = prelude.startsWith('@') ? -1 : source.indexOf('}', i);
      if (close === -1) {
        media.push(prelude.startsWith('@media') ? prelude : (media.at(-1) ?? null));
      } else {
        rules.push({
          body: source.slice(i + 1, close),
          index:
            start + (source.slice(start, i).length - source.slice(start, i).trimStart().length),
          media: media.at(-1) ?? null,
          selectors: prelude.split(',').map((selector) => selector.trim().replace(/\s+/g, ' ')),
        });
        i = close;
      }
      start = i + 1;
    } else if (char === '}') {
      media.pop();
      start = i + 1;
    } else if (char === ';' && source.slice(start, i).trim().startsWith('@')) {
      start = i + 1;
    }
  }
  return rules;
}

function declaration(body: string, property: string): string | undefined {
  return new RegExp(`(?:^|[;\\s])${property}\\s*:([^;]+)`).exec(body)?.[1]?.trim();
}

function lineAt(content: string, index: number): number {
  return content.slice(0, index).split('\n').length;
}

function columnGapPx(body: string): number | null | undefined {
  const gap = declaration(body, 'column-gap') ?? declaration(body, 'gap')?.split(/\s+/).at(-1);
  if (gap === undefined) {
    return undefined;
  }
  const px = /^(\d+(?:\.\d+)?)px$/.exec(gap);
  return px ? Number(px[1]) : null;
}

function trackCount(columns: string): number {
  let count = 0;
  const rest = columns.replace(/repeat\(\s*(\d+)\s*,(?:[^()]|\([^()]*\))*\)/g, (_, n: string) => {
    count += Number(n);
    return ' ';
  });
  return (
    count +
    rest
      .replace(/\([^()]*\)/g, '')
      .split(/\s+/)
      .filter(Boolean).length
  );
}

type GridOverride = { columns?: string; display?: string; gap: number | null | undefined };

function overrideFits(override: GridOverride, baseColumns: string, baseGap: number): boolean {
  if (override.display && !override.display.includes('grid')) {
    return true;
  }
  if (!override.columns && override.gap === undefined) {
    return false;
  }
  const gap = override.gap === undefined ? baseGap : override.gap;
  const columns = override.columns ?? baseColumns;
  return gap !== null && (trackCount(columns) - 1) * gap <= NARROWEST_GRID_PX;
}

/**
 * Seal text clears the dashed ring only because `.stats__scallop--seal` derives its
 * padding from the ring inset, and sticker text clears the teeth through the sticker's
 * padding. A per-instance padding on a scallop silently undoes that geometry.
 */
export function checkScallopPadding(
  cssFiles: ReadonlyMap<string, string>,
): Array<StructureViolation> {
  const owners = new Set(['.stats__scallop--seal', '.stats__scallop--sticker']);
  const violations: Array<StructureViolation> = [];
  for (const [file, content] of cssFiles) {
    for (const rule of cssRules(content)) {
      const scallop = rule.selectors.some(
        (selector) =>
          !owners.has(selector) &&
          /\.stats__scallop(?![\w-]*::?)/.test(selector.split(/[\s>+~]+/).at(-1) ?? ''),
      );
      if (scallop && /(?:^|[;\s])padding(?:-[a-z]+)?\s*:/.test(rule.body)) {
        violations.push({
          file,
          line: lineAt(content, rule.index),
          message:
            'Size the seal or sticker instead of overriding scallop padding, which keeps text inside the ring',
          rule: 'css-scallop-padding',
        });
      }
    }
  }
  return violations;
}

const lastCompound = (selector: string): string => selector.split(/[\s>+~]+/).at(-1) ?? '';

/**
 * Card heads swap their subtitle for a hover readout. A wrapping head moves that
 * subtitle onto a new line once the readout outgrows the space beside the title, which
 * drags the rows under the pointer away and makes the hover flicker. The head stacks
 * title over subtitle, and the subtitle stays one line.
 */
export function checkCardHeadStable(
  cssFiles: ReadonlyMap<string, string>,
): Array<StructureViolation> {
  const violations: Array<StructureViolation> = [];
  for (const [file, content] of cssFiles) {
    let asideBase: CssRule | undefined;
    let asideFirst: CssRule | undefined;
    for (const rule of cssRules(content)) {
      const compounds = rule.selectors.map(lastCompound);
      if (
        compounds.includes('.stats__head') &&
        declaration(rule.body, 'flex-wrap')?.startsWith('wrap')
      ) {
        violations.push({
          file,
          line: lineAt(content, rule.index),
          message:
            'Stack the card title over its subtitle instead of wrapping, so a hover readout never changes the head height',
          rule: 'css-card-head-wrap',
        });
      }
      if (!compounds.includes('.stats__aside')) {
        continue;
      }
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
        violations.push({
          file,
          line: lineAt(content, rule.index),
          message: 'Keep the card subtitle on one line, since it doubles as a hover readout',
          rule: 'css-card-head-wrap',
        });
      }
    }
    if (asideFirst && !asideBase) {
      violations.push({
        file,
        line: lineAt(content, asideFirst.index),
        message:
          '`.stats__aside` needs `white-space: nowrap` and `text-overflow: ellipsis` so a hover readout stays one line',
        rule: 'css-card-head-wrap',
      });
    }
  }
  return violations;
}

/**
 * A tag hung over a card's top edge and inside its right edge covers the end of the
 * card head. Each one needs a bounded width and a `:has(> tag)` rule that pads the head
 * clear of it, or a long title or readout runs underneath.
 */
export function checkCornerTagRoom(
  cssFiles: ReadonlyMap<string, string>,
): Array<StructureViolation> {
  const rulesByFile = new Map([...cssFiles].map(([file, content]) => [file, cssRules(content)]));
  const roomFor = new Set<string>();
  for (const rules of rulesByFile.values()) {
    for (const rule of rules) {
      if (!/(?:^|[;\s])padding(?:-right|-inline-end|-inline)?\s*:/.test(rule.body)) {
        continue;
      }
      for (const selector of rule.selectors) {
        for (const match of selector.matchAll(/:has\(>\s*(\.[\w-]+)\)/g)) {
          if (match[1] && /\.stats__head|\.stats__heading/.test(selector)) {
            roomFor.add(match[1]);
          }
        }
      }
    }
  }
  const violations: Array<StructureViolation> = [];
  for (const [file, rules] of rulesByFile) {
    for (const rule of rules) {
      const tag = rule.selectors.length === 1 ? rule.selectors[0] : undefined;
      if (!tag || !/^\.[\w-]+$/.test(tag) || rule.media) {
        continue;
      }
      const hangs =
        declaration(rule.body, 'position') === 'absolute' &&
        declaration(rule.body, 'top')?.startsWith('-') &&
        declaration(rule.body, 'right') !== undefined &&
        !declaration(rule.body, 'right')?.startsWith('-') &&
        !declaration(rule.body, 'z-index')?.startsWith('-');
      if (!hangs) {
        continue;
      }
      const problems = [
        declaration(rule.body, 'width') || declaration(rule.body, 'max-width')
          ? null
          : 'a `width` or `max-width`',
        roomFor.has(tag) ? null : `a \`.paperWrap:has(> ${tag})\` rule padding the card head`,
      ].filter(Boolean);
      if (problems.length > 0) {
        violations.push({
          file,
          line: lineAt(cssFiles.get(file) ?? '', rule.index),
          message: `Corner tag \`${tag}\` needs ${problems.join(' and ')} so card text keeps clear of it`,
          rule: 'css-corner-tag-room',
        });
      }
    }
  }
  return violations;
}

/**
 * A `repeat(n, …)` grid whose column gaps alone are wider than a phone collapses every
 * track to zero and pushes full-width children past the page edge. It must switch to
 * fewer columns in a `max-width` media query.
 */
export function checkGridGapsFit(cssFiles: ReadonlyMap<string, string>): Array<StructureViolation> {
  const rulesByFile = new Map([...cssFiles].map(([file, content]) => [file, cssRules(content)]));
  const overrides = new Map<string, Array<GridOverride>>();
  for (const rules of rulesByFile.values()) {
    for (const rule of rules) {
      if (!rule.media?.includes('max-width')) {
        continue;
      }
      const override = {
        columns: declaration(rule.body, 'grid-template-columns'),
        display: declaration(rule.body, 'display'),
        gap: columnGapPx(rule.body),
      };
      for (const selector of rule.selectors) {
        overrides.set(selector, [...(overrides.get(selector) ?? []), override]);
      }
    }
  }

  const violations: Array<StructureViolation> = [];
  for (const [file, rules] of rulesByFile) {
    for (const rule of rules) {
      const columns = declaration(rule.body, 'grid-template-columns');
      const gap = columnGapPx(rule.body);
      if (!columns || gap === null || gap === undefined) {
        continue;
      }
      const gapsPx = (trackCount(columns) - 1) * gap;
      const collapses = rule.selectors.every((selector) =>
        (overrides.get(selector) ?? []).some((override) => overrideFits(override, columns, gap)),
      );
      if (gapsPx > NARROWEST_GRID_PX && !collapses) {
        violations.push({
          file,
          line: lineAt(cssFiles.get(file) ?? '', rule.index),
          message: `${trackCount(columns)} columns with ${gap}px gaps need ${gapsPx}px, wider than a ${NARROWEST_GRID_PX}px phone box; collapse the columns in a max-width media query`,
          rule: 'css-grid-gaps-fit',
        });
      }
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
  ];
}

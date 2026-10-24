import type { CSSProperties } from 'react';
import type { SxObject, SxProps } from './index';

const BREAKPOINT_ORDER = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
type BreakpointKey = (typeof BREAKPOINT_ORDER)[number];

const BREAKPOINT_MEDIA: Record<BreakpointKey, string> = {
  lg: '@media (min-width: 992px)',
  md: '@media (min-width: 768px)',
  sm: '@media (min-width: 576px)',
  xl: '@media (min-width: 1200px)',
  xs: '@media (min-width: 0px)',
};

const SPACING_SHORTHANDS: Record<string, string> = {
  m: 'margin',
  marginBlock: 'margin-block',
  marginInline: 'margin-inline',
  marginX: 'margin-inline',
  marginY: 'margin-block',
  mb: 'margin-bottom',
  ml: 'margin-left',
  mr: 'margin-right',
  mt: 'margin-top',
  mx: 'margin-inline',
  my: 'margin-block',
  p: 'padding',
  paddingBlock: 'padding-block',
  paddingInline: 'padding-inline',
  paddingX: 'padding-inline',
  paddingY: 'padding-block',
  pb: 'padding-bottom',
  pl: 'padding-left',
  pr: 'padding-right',
  pt: 'padding-top',
  px: 'padding-inline',
  py: 'padding-block',
};

const SPACING_PROPERTIES = new Set([
  ...Object.keys(SPACING_SHORTHANDS),
  'gap',
  'rowGap',
  'columnGap',
  'gridGap',
  'gridRowGap',
  'gridColumnGap',
  'margin',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'marginInlineStart',
  'marginInlineEnd',
  'marginBlockStart',
  'marginBlockEnd',
  'padding',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'paddingInlineStart',
  'paddingInlineEnd',
  'paddingBlockStart',
  'paddingBlockEnd',
]);

const UNITLESS_PROPERTIES = new Set([
  'animationIterationCount',
  'aspectRatio',
  'columnCount',
  'columns',
  'fillOpacity',
  'flex',
  'flexGrow',
  'flexShrink',
  'fontWeight',
  'gridArea',
  'gridColumn',
  'gridColumnEnd',
  'gridColumnStart',
  'gridRow',
  'gridRowEnd',
  'gridRowStart',
  'lineClamp',
  'lineHeight',
  'opacity',
  'order',
  'scale',
  'strokeOpacity',
  'strokeWidth',
  'WebkitLineClamp',
  'zIndex',
  'zoom',
]);

const PALETTE_TOKENS: Record<string, string> = {
  'background.default': 'var(--dg-palette-background-default)',
  'background.paper': 'var(--dg-palette-background-paper)',
  divider: 'var(--dg-palette-divider)',
  'text.primary': 'var(--dg-palette-text-primary)',
  'text.secondary': 'var(--dg-palette-text-secondary)',
};

function toKebabCase(prop: string): string {
  if (prop.startsWith('--')) return prop;
  const kebab = prop.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
  return kebab.startsWith('webkit-') || kebab.startsWith('moz-') || kebab.startsWith('ms-')
    ? `-${kebab}`
    : kebab;
}

function formatCssValue(prop: string, value: string | number): string {
  if (typeof value === 'string') {
    return (prop === 'color' || prop === 'backgroundColor') && PALETTE_TOKENS[value]
      ? PALETTE_TOKENS[value]
      : value;
  }
  if (SPACING_PROPERTIES.has(prop)) return value === 0 ? '0px' : `${value * 8}px`;
  if (prop === 'borderRadius') return value === 0 ? '0px' : `${value * 4}px`;
  if (UNITLESS_PROPERTIES.has(prop) || prop.startsWith('--')) return String(value);
  return value === 0 ? '0px' : `${value}px`;
}

function isBreakpointObject(val: unknown): val is Partial<Record<BreakpointKey, string | number>> {
  if (typeof val !== 'object' || val === null || Array.isArray(val)) return false;
  const keys = Object.keys(val);
  return (
    keys.length > 0 &&
    keys.every(
      (k) =>
        (BREAKPOINT_ORDER as ReadonlyArray<string>).includes(k) &&
        (typeof (val as Record<string, unknown>)[k] === 'string' ||
          typeof (val as Record<string, unknown>)[k] === 'number' ||
          (val as Record<string, unknown>)[k] === undefined),
    )
  );
}

function resolveSelector(parentSelector: string, nestedKey: string): string {
  const parents = parentSelector.split(',').map((parent) => parent.trim());
  return nestedKey
    .split(',')
    .flatMap((part) => {
      const trimmed = part.trim();
      return parents.map((parent) => {
        if (trimmed.includes('&')) return trimmed.replaceAll('&', parent);
        return trimmed.startsWith(':') ? `${parent}${trimmed}` : `${parent} ${trimmed}`;
      });
    })
    .join(', ');
}

const expandPropertyDeclaration = (prop: string, value: string | number): string =>
  `${SPACING_SHORTHANDS[prop] ?? toKebabCase(prop)}: ${formatCssValue(prop, value)};`;

function compileSxObject(selector: string, obj: SxObject): string {
  const baseDecls: Array<string> = [];
  const mediaDecls: Record<BreakpointKey, Array<string>> = {
    lg: [],
    md: [],
    sm: [],
    xl: [],
    xs: [],
  };
  const nestedBlocks: Array<string> = [];

  for (const [key, rawValue] of Object.entries(obj)) {
    if (rawValue === undefined || rawValue === null || rawValue === false) continue;
    if (typeof rawValue === 'string' || typeof rawValue === 'number') {
      baseDecls.push(expandPropertyDeclaration(key, rawValue));
      continue;
    }
    if (isBreakpointObject(rawValue)) {
      for (const bp of BREAKPOINT_ORDER) {
        const bpVal = rawValue[bp];
        if (bpVal !== undefined) mediaDecls[bp].push(expandPropertyDeclaration(key, bpVal));
      }
      continue;
    }
    if (typeof rawValue === 'object' && !Array.isArray(rawValue)) {
      if (key.startsWith('@media') || key.startsWith('@supports') || key.startsWith('@container')) {
        const inner = compileSxObject(selector, rawValue as SxObject);
        if (inner) nestedBlocks.push(`${key} { ${inner} }`);
      } else if (key.startsWith('@keyframes')) {
        const frames: Array<string> = [];
        for (const [step, stepObj] of Object.entries(rawValue as Record<string, SxObject>)) {
          if (stepObj && typeof stepObj === 'object') {
            const stepDecls = Object.entries(stepObj).flatMap(([sp, sv]) =>
              typeof sv === 'string' || typeof sv === 'number'
                ? [expandPropertyDeclaration(sp, sv)]
                : [],
            );
            frames.push(`${step} { ${stepDecls.join(' ')} }`);
          }
        }
        nestedBlocks.push(`${key} { ${frames.join(' ')} }`);
      } else {
        const childCss = compileSxObject(resolveSelector(selector, key), rawValue as SxObject);
        if (childCss) nestedBlocks.push(childCss);
      }
    }
  }

  const rules: Array<string> = [];
  if (baseDecls.length > 0) rules.push(`${selector} { ${baseDecls.join(' ')} }`);
  for (const bp of BREAKPOINT_ORDER) {
    if (mediaDecls[bp].length > 0) {
      rules.push(`${BREAKPOINT_MEDIA[bp]} { ${selector} { ${mediaDecls[bp].join(' ')} } }`);
    }
  }
  rules.push(...nestedBlocks);
  return rules.join('\n');
}

function flattenSxItems(sx: SxProps, out: Array<SxObject>): void {
  if (!sx || typeof sx !== 'object') return;
  if (Array.isArray(sx)) {
    for (const item of sx) flattenSxItems(item, out);
    return;
  }
  out.push(sx as SxObject);
}

function mergeTwoSxObjects(target: SxObject, source: SxObject): SxObject {
  const result: SxObject = { ...target };
  for (const [k, v] of Object.entries(source)) {
    if (v === undefined) continue;
    const existing = result[k];
    if (
      existing &&
      typeof existing === 'object' &&
      !Array.isArray(existing) &&
      v &&
      typeof v === 'object' &&
      !Array.isArray(v) &&
      !isBreakpointObject(existing) &&
      !isBreakpointObject(v)
    ) {
      result[k] = mergeTwoSxObjects(existing as SxObject, v as SxObject);
    } else {
      result[k] = v;
    }
  }
  return result;
}

function mergeSxObjects(sx?: SxProps): SxObject | null {
  if (!sx) return null;
  if (!Array.isArray(sx)) return sx as SxObject;
  const items: Array<SxObject> = [];
  flattenSxItems(sx, items);
  if (items.length === 0) return null;
  return items.reduce<SxObject>(mergeTwoSxObjects, {});
}

function hashString(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

type CompiledSx = {
  className: string;
  css: string;
};

const SX_CACHE = new Map<string, CompiledSx | null>();

export function compileSx(sx?: SxProps): CompiledSx | null {
  const merged = mergeSxObjects(sx);
  if (!merged) return null;
  const serialized = JSON.stringify(merged);
  if (serialized === '{}') return null;
  const cached = SX_CACHE.get(serialized);
  if (cached !== undefined) return cached;
  const className = `css-${hashString(serialized)}`;
  const css = compileSxObject(`.${className}`, merged);
  if (!css) {
    SX_CACHE.set(serialized, null);
    return null;
  }
  const result = { className, css };
  SX_CACHE.set(serialized, result);
  return result;
}

export function SxStyle({ compiled }: { compiled: CompiledSx | null }) {
  if (!compiled) return null;
  return (
    <style href={compiled.className} precedence="default">
      {compiled.css}
    </style>
  );
}

export function joinClasses(
  ...classes: Array<string | undefined | null | false>
): string | undefined {
  return classes.filter(Boolean).join(' ') || undefined;
}

export type { CSSProperties };

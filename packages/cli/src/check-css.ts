import path from 'node:path';
import type { StructureViolation } from './check-structure.js';

const CSS_IMPORT_PATTERN =
  /(?:^\s*import\s+['"]([^'"]+\.css)['"]|^\s*@import\s+['"]([^'"]+\.css)['"])/gm;

const DYNAMIC_CLASS_PREFIXES: ReadonlyArray<{
  prefix: string;
  values: ReadonlyArray<string>;
}> = [
  { prefix: 'cutOut--', values: ['flat', 'lifted', 'tilted'] },
  {
    prefix: 'collageSheet-',
    values: ['checker', 'stripes', 'dots', 'gingham', 'grid', 'ruled', 'starfield'],
  },
  { prefix: 'collageSheetEdge-', values: ['disc', 'pebble'] },
  { prefix: 'collageCard--', values: ['1', '2', '3', '4', '5', '6'] },
  { prefix: 'collageCardPin--', values: ['brass', 'red', 'ink', 'forest', 'cobalt'] },
  { prefix: 'devConsoleChip--', values: ['success', 'warning', 'error', 'neutral'] },
  { prefix: 'home__', values: ['tagTopLeft', 'tagBottomLeft', 'tagBottomRight'] },
];

const IGNORED_CLASS_TOKENS: ReadonlySet<string> = new Set([
  'light',
  'dark',
  'Mui-checked',
  'MuiSwitch-thumb',
  'MuiSwitch-track',
]);

function resolveCssSpecifier(importerPath: string, specifier: string): string | null {
  if (specifier.startsWith('.')) {
    return path.posix.normalize(path.posix.join(path.posix.dirname(importerPath), specifier));
  }
  if (specifier.startsWith('@dg/')) {
    return path.posix.normalize(`packages/${specifier.slice('@dg/'.length)}`);
  }
  return null;
}

export function checkOrphanCssFiles(
  cssPaths: ReadonlyArray<string>,
  importers: ReadonlyMap<string, string>,
): Array<StructureViolation> {
  const importedCss = new Set<string>();
  for (const [relPath, content] of importers) {
    for (const match of content.matchAll(CSS_IMPORT_PATTERN)) {
      const specifier = match[1] ?? match[2];
      if (!specifier) {
        continue;
      }
      const resolved = resolveCssSpecifier(relPath, specifier);
      if (resolved) {
        importedCss.add(resolved);
      }
    }
  }

  const violations: Array<StructureViolation> = [];
  for (const cssPath of cssPaths) {
    if (!importedCss.has(cssPath)) {
      violations.push({
        file: cssPath,
        line: 1,
        message: 'Stylesheet is not imported by any source or CSS file',
        rule: 'no-orphan-css',
      });
    }
  }
  return violations;
}

export function extractDefinedCssClasses(
  cssFiles: ReadonlyMap<string, string>,
): Map<string, { file: string; files: Set<string>; line: number }> {
  const defined = new Map<string, { file: string; files: Set<string>; line: number }>();

  for (const [file, rawContent] of cssFiles) {
    // Strip comments, @import lines, and leaf declaration blocks while preserving newlines
    const withoutComments = rawContent
      .replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, ' '))
      .replace(/^\s*@import\s+[^\n]+$/gm, '');
    const selectorsOnly = withoutComments.replace(/\{[^{}]*\}/g, (match) =>
      match.replace(/[^\n]/g, ' '),
    );

    const lines = selectorsOnly.split('\n');
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i] ?? '';
      for (const match of line.matchAll(/\.([a-zA-Z_][a-zA-Z0-9_-]*)/g)) {
        const cls = match[1];
        if (!cls) {
          continue;
        }
        const existing = defined.get(cls);
        if (existing) {
          existing.files.add(file);
        } else {
          defined.set(cls, { file, files: new Set([file]), line: i + 1 });
        }
      }
    }
  }

  return defined;
}

function collectClassTokensFromLiterals(
  expr: string,
  line: number,
  onToken: (token: string, line: number) => void,
) {
  // Strip equality comparison literals like `=== 'solid'` or `!== 'torn'`
  const withoutComparisons = expr.replace(
    /(?:===|!==|==|!=)\s*(?:'[^']*'|"[^"]*"|`[^`]*`)|(?:'[^']*'|"[^"]*"|`[^`]*`)\s*(?:===|!==|==|!=)/g,
    ' ',
  );
  // Extract any inner string/template literals inside ${...} before replacing ${...} with __DYN__
  const innerLiterals: Array<string> = [];
  const withoutTemplateExprs = withoutComparisons.replace(
    /\$\{([^{}]*)\}/g,
    (_full, inner: string) => {
      for (const innerMatch of inner.matchAll(/(?:'([^'\\]*)'|"([^"\\]*)"|`([^`\\]*)`)/g)) {
        const lit = innerMatch[1] ?? innerMatch[2] ?? innerMatch[3];
        if (lit) {
          innerLiterals.push(lit);
        }
      }
      return '__DYN__';
    },
  );

  const literalStrings = [
    ...innerLiterals,
    ...[
      ...withoutTemplateExprs.matchAll(/'([^'\\]*)'/g),
      ...withoutTemplateExprs.matchAll(/"([^"\\]*)"/g),
      ...withoutTemplateExprs.matchAll(/`([^`\\]*)`/g),
    ].map((m) => m[1] ?? ''),
  ];

  for (const raw of literalStrings) {
    for (const token of raw.split(/\s+/)) {
      const trimmed = token.trim();
      if (!trimmed || IGNORED_CLASS_TOKENS.has(trimmed)) {
        continue;
      }
      if (trimmed.includes('__DYN__')) {
        const prefix = trimmed.slice(0, trimmed.indexOf('__DYN__'));
        if (!prefix) {
          continue;
        }
        const expansion = DYNAMIC_CLASS_PREFIXES.find((entry) => entry.prefix === prefix);
        if (expansion) {
          for (const suffix of expansion.values) {
            onToken(`${prefix}${suffix}`, line);
          }
        } else if (!/[-_]$/.test(prefix) && /^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(prefix)) {
          onToken(prefix, line);
        }
        continue;
      }
      if (/^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(trimmed)) {
        onToken(trimmed, line);
      }
    }
  }
}

function findMatchingBraceEnd(content: string, openBraceIndex: number): number {
  let depth = 0;
  for (let i = openBraceIndex; i < content.length; i += 1) {
    const ch = content[i];
    if (ch === '{') {
      depth += 1;
    } else if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        return i;
      }
    }
  }
  return content.length - 1;
}

function isCheckableSourceFile(file: string): boolean {
  return (
    !file.includes('__tests__/') &&
    !/\.test\.(ts|tsx)$/.test(file) &&
    !file.startsWith('packages/cli/')
  );
}

function lineNumberAt(content: string, offset: number): number {
  let line = 1;
  for (let i = 0; i < offset && i < content.length; i += 1) {
    if (content[i] === '\n') {
      line += 1;
    }
  }
  return line;
}

export function extractReferencedCssClasses(
  sourceFiles: ReadonlyMap<string, string>,
): Array<{ cls: string; file: string; line: number }> {
  const usages: Array<{ cls: string; file: string; line: number }> = [];

  for (const [file, content] of sourceFiles) {
    if (!isCheckableSourceFile(file)) {
      continue;
    }

    // 1. Direct string props: className="...", innerClassName="...", share="..."
    for (const match of content.matchAll(
      /\b(?:className|innerClassName|share)\s*=\s*(?:"([^"]+)"|'([^']+)')/g,
    )) {
      const line = lineNumberAt(content, match.index ?? 0);
      const val = match[1] ?? match[2] ?? '';
      collectClassTokensFromLiterals(`"${val}"`, line, (cls, tokenLine) => {
        usages.push({ cls, file, line: tokenLine });
      });
    }

    // 2. Brace props: className={...}, innerClassName={...} (balanced braces)
    for (const match of content.matchAll(/\b(?:className|innerClassName)\s*=\s*\{/g)) {
      const start = match.index ?? 0;
      const openBrace = start + match[0].length - 1;
      const closeBrace = findMatchingBraceEnd(content, openBrace);
      const expr = content.slice(openBrace + 1, closeBrace);
      const line = lineNumberAt(content, start);
      collectClassTokensFromLiterals(expr, line, (cls, tokenLine) => {
        usages.push({ cls, file, line: tokenLine });
      });
    }

    // 3. cx(...) calls, *Class/*ClassName(...) helper functions, and object properties
    const extraPatterns: ReadonlyArray<RegExp> = [
      /\bcx\(([\s\S]*?)\)/g,
      /\bfunction\s+\w*Class(?:Name)?\b[^{]*\{([\s\S]*?)\n\}/g,
      /\bconst\s+visibility\s*=([\s\S]*?);/g,
      /\b(?:className|innerClassName|share)\s*:\s*('[^']+'|"[^"]+"|`[^`]+`)/g,
      /\[PAGE_TRANSITION_TYPES\.\w+\]\s*:\s*('[^']+'|"[^"]+")/g,
    ];
    for (const pattern of extraPatterns) {
      for (const match of content.matchAll(pattern)) {
        const line = lineNumberAt(content, match.index ?? 0);
        collectClassTokensFromLiterals(match[1] ?? '', line, (cls, tokenLine) => {
          usages.push({ cls, file, line: tokenLine });
        });
      }
    }
  }

  return usages;
}

export function checkCssClassesAndVariables(
  cssFiles: ReadonlyMap<string, string>,
  sourceFiles: ReadonlyMap<string, string>,
): Array<StructureViolation> {
  const violations: Array<StructureViolation> = [];
  const definedClasses = extractDefinedCssClasses(cssFiles);
  const referencedUsages = extractReferencedCssClasses(sourceFiles);
  const referencedSet = new Set<string>();

  for (const usage of referencedUsages) {
    referencedSet.add(usage.cls);
    if (!definedClasses.has(usage.cls)) {
      violations.push({
        file: usage.file,
        line: usage.line,
        message: `CSS class ".${usage.cls}" is used in JSX/TS but never defined in any imported .css file`,
        rule: 'undefined-css-class',
      });
    }
  }

  for (const [cls, loc] of definedClasses) {
    if (!referencedSet.has(cls)) {
      violations.push({
        file: loc.file,
        line: loc.line,
        message: `CSS class ".${cls}" is defined in CSS but never referenced in JSX/TS`,
        rule: 'unused-css-class',
      });
    }
  }

  // CSS Custom Properties (--*) definition vs var(--*) usage check
  const definedVars = new Set<string>();

  for (const content of cssFiles.values()) {
    for (const match of content.matchAll(/(--[a-zA-Z0-9_-]+)\s*:/g)) {
      if (match[1]) {
        definedVars.add(match[1]);
      }
    }
  }

  for (const [file, content] of sourceFiles) {
    if (file.startsWith('packages/cli/')) {
      continue;
    }
    for (const match of content.matchAll(
      /(?:['"]?(--[a-zA-Z0-9_-]+)['"]?\s*:|variable:\s*['"](--[a-zA-Z0-9_-]+)['"])/g,
    )) {
      const varName = match[1] ?? match[2];
      if (varName) {
        definedVars.add(varName);
      }
    }
  }

  const isDefinedCssVar = (varName: string): boolean =>
    definedVars.has(varName) || varName.startsWith('--mui-');

  const checkVarUsagesInFile = (file: string, content: string) => {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i] ?? '';
      for (const match of line.matchAll(/var\(\s*(--[a-zA-Z0-9_-]+)/g)) {
        const varName = match[1];
        if (varName && !isDefinedCssVar(varName)) {
          violations.push({
            file,
            line: i + 1,
            message: `CSS custom property "${varName}" is used via var() but never defined`,
            rule: 'undefined-css-variable',
          });
        }
      }
    }
  };

  for (const [file, content] of cssFiles) {
    checkVarUsagesInFile(file, content);
  }
  for (const [file, content] of sourceFiles) {
    if (isCheckableSourceFile(file)) {
      checkVarUsagesInFile(file, content);
    }
  }

  return violations;
}

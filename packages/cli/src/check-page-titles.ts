import type { StructureViolation } from './check-structure.js';

export function isTestFile(relPath: string): boolean {
  return (
    relPath.includes('__tests__/') ||
    /\.test\.(ts|tsx)$/.test(relPath) ||
    relPath.endsWith('jest.config.ts')
  );
}

export function lineAt(content: string, index: number): number {
  return content.slice(0, index).split('\n').length;
}

const PAGE_TITLE_THEN_PARAGRAPH =
  /<CutLetters\b[^>]*\bclassName="[^"]*\bcollagePageTitle\b[^"]*"[^>]*\/>\s*(?:\{[^}]*\}\s*)?<p\b/g;

/** Page titles stand alone; a paragraph set right under one reads as a subtitle. */
export function checkNoPageSubtitles(
  webSources: ReadonlyMap<string, string>,
): Array<StructureViolation> {
  const violations: Array<StructureViolation> = [];
  for (const [file, content] of webSources) {
    if (!file.endsWith('.tsx') || isTestFile(file)) {
      continue;
    }
    for (const match of content.matchAll(PAGE_TITLE_THEN_PARAGRAPH)) {
      violations.push({
        file,
        line: lineAt(content, match.index),
        message: 'Page titles have no subtitle; drop the paragraph under the CutLetters title',
        rule: 'no-page-subtitle',
      });
    }
  }
  return violations;
}

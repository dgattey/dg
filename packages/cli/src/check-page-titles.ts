import type { StructureViolation } from './check-structure.js';

const PAGE_TITLE_THEN_PARAGRAPH =
  /<CutLetters\b[^>]*\bclassName="[^"]*\bcollagePageTitle\b[^"]*"[^>]*\/>\s*(?:\{[^}]*\}\s*)?<p\b/g;

/** Page titles stand alone; a paragraph set right under one reads as a subtitle. */
export function checkNoPageSubtitles(
  webSources: ReadonlyMap<string, string>,
): Array<StructureViolation> {
  const violations: Array<StructureViolation> = [];
  for (const [file, content] of webSources) {
    if (!file.endsWith('.tsx') || file.includes('__tests__/')) {
      continue;
    }
    for (const match of content.matchAll(PAGE_TITLE_THEN_PARAGRAPH)) {
      violations.push({
        file,
        line: content.slice(0, match.index).split('\n').length,
        message: 'Page titles have no subtitle; drop the paragraph under the CutLetters title',
        rule: 'no-page-subtitle',
      });
    }
  }
  return violations;
}

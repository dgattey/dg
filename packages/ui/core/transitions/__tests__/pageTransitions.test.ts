import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { rememberPageOrigin, takePageOrigin } from '../pageScrollMemory';
import {
  albumArtViewTransitionName,
  albumTransitionTypes,
  pageTransitionTypes,
  pageViewTransitionProps,
} from '../pageTransitions';

const css = readFileSync(join(__dirname, '..', 'pageTransitions.css'), 'utf8');

function keyframeBlock(name: string): string {
  const match = css.match(new RegExp(`@keyframes\\s+${name}\\s*\\{([\\s\\S]*?)\\n\\}`));
  return match?.[1] ?? '';
}

describe('pageTransitions', () => {
  it('maps navigation intents to distinct page and album transition types', () => {
    expect(pageTransitionTypes('open')).toEqual(['page-open']);
    expect(pageTransitionTypes('close')).toEqual(['page-close']);
    expect(albumTransitionTypes('open')).toEqual(['album-open']);
    expect(albumTransitionTypes('close')).toEqual(['album-close']);
    expect(albumArtViewTransitionName('abc')).toBe('album-art-abc');
  });

  it('wires enter and exit classes for page-open and page-close', () => {
    expect(pageViewTransitionProps).toEqual({
      default: 'none',
      enter: {
        default: 'none',
        'page-close': 'vt-page-reveal',
        'page-open': 'vt-page-rise',
      },
      exit: {
        default: 'none',
        'page-close': 'vt-page-fall',
        'page-open': 'vt-page-recede',
      },
    });
  });

  it('fades arriving page content in from 0 to 1 and departing page content out from 1 to 0', () => {
    for (const entering of ['vt-page-rise', 'vt-page-reveal']) {
      const block = keyframeBlock(entering);
      expect(block).toMatch(/from\s*\{[^}]*opacity:\s*0\b/);
      expect(block).toMatch(/to\s*\{[^}]*opacity:\s*1\b/);
    }
    for (const exiting of ['vt-page-recede', 'vt-page-fall']) {
      const block = keyframeBlock(exiting);
      expect(block).toMatch(/from\s*\{[^}]*opacity:\s*1\b/);
      expect(block).toMatch(/to\s*\{[^}]*opacity:\s*0\b/);
    }
  });

  it('pins site-header above rising and falling page content during page transitions', () => {
    expect(css).toContain('::view-transition-group(site-header)');
    expect(css).toContain('::view-transition-old(site-header)');
    expect(css).toContain('::view-transition-new(site-header)');
  });

  it('disables view-transition animations under prefers-reduced-motion: reduce', () => {
    expect(css).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?animation-duration:\s*0s/,
    );
  });

  it('remembers and consumes scroll origin once for the matching pathname', () => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 420 });
    rememberPageOrigin('/reading');

    expect(takePageOrigin('/music')).toBeNull();
    expect(takePageOrigin('/reading')).toBe(420);
    expect(takePageOrigin('/reading')).toBeNull();
  });
});

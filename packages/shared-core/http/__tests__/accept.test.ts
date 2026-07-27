import { hasExplicitType, parseAccept, preferredType } from '../accept';

describe('parseAccept', () => {
  it('parses q-values and preserves order', () => {
    expect(parseAccept('text/html, text/markdown;q=0.5')).toEqual([
      { q: 1, specificity: 2, type: 'text/html' },
      { q: 0.5, specificity: 2, type: 'text/markdown' },
    ]);
  });
});

describe('preferredType', () => {
  const produces = ['text/html', 'text/markdown'] as const;

  it('defaults to the first produced type when Accept is missing', () => {
    expect(preferredType(null, produces)).toBe('text/html');
  });

  it('prefers markdown when listed first', () => {
    expect(preferredType('text/markdown, text/html, */*', produces)).toBe('text/markdown');
  });

  it('honors higher q for html over markdown', () => {
    expect(preferredType('text/html, text/markdown;q=0.5', produces)).toBe('text/html');
  });

  it('returns null when every produced type is rejected', () => {
    expect(preferredType('text/html;q=0, text/markdown;q=0', produces)).toBeNull();
  });

  it('returns null for unrelated types', () => {
    expect(preferredType('application/pdf', produces)).toBeNull();
  });
});

describe('hasExplicitType', () => {
  it('detects an explicit markdown preference', () => {
    expect(hasExplicitType('text/markdown, text/html', 'text/markdown')).toBe(true);
    expect(hasExplicitType('text/html', 'text/markdown')).toBe(false);
  });
});

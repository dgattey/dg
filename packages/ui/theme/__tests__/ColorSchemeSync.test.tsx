import { render } from '@testing-library/react';
import { ColorSchemeSync } from '../ColorSchemeSync';
import { COLOR_SCHEME_ATTRIBUTE, COLOR_SCHEME_STORAGE_KEY } from '../colorScheme';

describe('ColorSchemeSync', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute(COLOR_SCHEME_ATTRIBUTE);
  });

  it('restores a stored preference that was stripped off the root', () => {
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, 'dark');

    render(<ColorSchemeSync />);

    expect(document.documentElement).toHaveAttribute(COLOR_SCHEME_ATTRIBUTE, 'dark');
  });

  it('restores it again after a later strip', () => {
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, 'light');
    const { rerender } = render(<ColorSchemeSync />);

    document.documentElement.removeAttribute(COLOR_SCHEME_ATTRIBUTE);
    rerender(<ColorSchemeSync key="second" />);

    expect(document.documentElement).toHaveAttribute(COLOR_SCHEME_ATTRIBUTE, 'light');
  });

  it('leaves the root untouched without a stored preference', () => {
    render(<ColorSchemeSync />);

    expect(document.documentElement).not.toHaveAttribute(COLOR_SCHEME_ATTRIBUTE);
  });
});

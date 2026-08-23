/**
 * @jest-environment jsdom
 */

import { favoriteAlbumsRoute, homeRoute, musicRoute } from '@dg/shared-core/routes/app';
import { render, screen } from '@testing-library/react';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
}));

jest.mock('@dg/ui/theme/GreenhouseTypeProvider', () => ({
  GreenhouseTypeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@dg/ui/theme/useColorScheme', () => ({
  useColorScheme: () => ({
    preference: 'system',
    setPreference: jest.fn(),
  }),
}));

jest.mock('../SiteHeaderHeight', () => ({
  SiteHeaderHeight: () => null,
}));

import { usePathname } from 'next/navigation';
import { GreenhouseHeader } from '../GreenhouseHeader';

const mockPathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('GreenhouseHeader', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/');
  });

  it('renders one glass bar with wordmark, text links, and a theme toggle', () => {
    render(<GreenhouseHeader />);

    const nav = screen.getByRole('navigation', { name: 'Site' });
    expect(nav.querySelectorAll('[data-greenhouse-header-bar]')).toHaveLength(1);
    expect(nav.querySelector('[data-capsule-glass]')).toBeNull();
    expect(screen.getByRole('button', { name: 'dg.' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Listening' })).toHaveAttribute('href', musicRoute);
    expect(screen.getByRole('link', { name: 'Albums' })).toHaveAttribute(
      'href',
      favoriteAlbumsRoute,
    );
    expect(screen.getByRole('button', { name: 'Color scheme: system' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Music' })).not.toBeInTheDocument();
    expect(
      Array.from(document.querySelectorAll('style'))
        .map((node) => node.textContent)
        .join(''),
    ).toContain('[data-sticky-mask]');
  });

  it('marks the listening link current on the music page', () => {
    mockPathname.mockReturnValue(musicRoute);
    render(<GreenhouseHeader />);
    expect(screen.getByRole('link', { name: 'Listening' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', homeRoute);
  });
});

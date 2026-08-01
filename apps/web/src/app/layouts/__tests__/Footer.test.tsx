/**
 * @jest-environment jsdom
 */

import { favoriteAlbumsRoute, musicRoute } from '@dg/shared-core/routes/app';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('../../../flags', () => ({
  interactiveRedesign: jest.fn(),
}));

jest.mock('../../../services/contentful', () => ({
  getFooterLinks: jest.fn(async () => []),
}));

jest.mock('../../../services/version', () => ({
  getAppVersionInfo: jest.fn(async () => ({ releaseUrl: null, version: '1.2.3' })),
}));

jest.mock('next/cache', () => ({
  cacheLife: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
}));

jest.mock('@dg/ui/core/sheet/SheetOpenLink', () => ({
  SheetOpenLink: ({
    children,
    href,
    title,
  }: {
    children: React.ReactNode;
    href: string;
    title: string;
  }) => (
    <a href={href} title={title}>
      {children}
    </a>
  ),
}));

import { interactiveRedesign } from '../../../flags';
import { getFooterLinks } from '../../../services/contentful';
import { Footer, RedesignBadge } from '../Footer';

const mockInteractiveRedesign = interactiveRedesign as jest.MockedFunction<
  typeof interactiveRedesign
>;
const mockGetFooterLinks = getFooterLinks as jest.MockedFunction<typeof getFooterLinks>;

describe('Footer redesign badge', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows redesign on when the flag is true', async () => {
    mockInteractiveRedesign.mockResolvedValue(true);
    render(await RedesignBadge());
    expect(screen.getByText('redesign on')).toBeInTheDocument();
  });

  it('hides the badge when the flag is false', async () => {
    mockInteractiveRedesign.mockResolvedValue(false);
    const { container } = render(await RedesignBadge());
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the footer shell without a listening-history text link', async () => {
    mockInteractiveRedesign.mockResolvedValue(false);
    mockGetFooterLinks.mockResolvedValue([]);
    render(await Footer());
    expect(screen.getByText(/Dylan Gattey/)).toBeInTheDocument();
    expect(screen.queryByText('Listening history')).not.toBeInTheDocument();
  });

  it('turns the favorite-albums icon into the music menu', async () => {
    const user = userEvent.setup();
    mockInteractiveRedesign.mockResolvedValue(false);
    mockGetFooterLinks.mockResolvedValue([
      { icon: 'albums', title: 'Favorite albums', url: favoriteAlbumsRoute },
      { icon: 'github', title: 'GitHub', url: 'https://github.com/dgattey' },
    ]);
    render(await Footer());

    expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Favorite albums' }));
    expect(screen.getByRole('link', { name: 'Favorite albums' })).toHaveAttribute(
      'href',
      favoriteAlbumsRoute,
    );
    expect(screen.getByRole('link', { name: 'Listening history' })).toHaveAttribute(
      'href',
      musicRoute,
    );
  });

  it('matches favorite-albums URLs with a trailing slash', async () => {
    mockInteractiveRedesign.mockResolvedValue(false);
    mockGetFooterLinks.mockResolvedValue([
      { icon: 'albums', title: 'Favorite albums', url: `${favoriteAlbumsRoute}/` },
    ]);
    render(await Footer());
    expect(screen.getByRole('button', { name: 'Favorite albums' })).toBeInTheDocument();
  });
});

/**
 * @jest-environment jsdom
 */

import { favoriteAlbumsRoute } from '@dg/shared-core/routes/app';
import { render, screen } from '@testing-library/react';

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

jest.mock('@dg/ui/core/transitions/PageTransitionLink', () => ({
  PageTransitionLink: ({
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

  it('renders the footer shell without music destination links', async () => {
    mockInteractiveRedesign.mockResolvedValue(false);
    mockGetFooterLinks.mockResolvedValue([]);
    render(await Footer());
    expect(screen.getByText(/Dylan Gattey/)).toBeInTheDocument();
    expect(screen.queryByText('Listening history')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Favorite albums' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Music' })).not.toBeInTheDocument();
  });

  it('renders social icon links from Contentful without a music disc', async () => {
    mockInteractiveRedesign.mockResolvedValue(false);
    mockGetFooterLinks.mockResolvedValue([
      { icon: 'cursor', title: 'Cursor', url: 'https://cursor.com' },
      { icon: 'github', title: 'GitHub', url: 'https://github.com/dgattey' },
      { icon: 'spotify', title: 'Spotify', url: 'https://open.spotify.com/user/dylangattey' },
    ]);
    render(await Footer());

    const cursor = screen.getByRole('link', { name: 'Cursor' });
    const github = screen.getByRole('link', { name: 'GitHub' });
    const spotify = screen.getByRole('link', { name: 'Spotify' });
    expect(cursor).toHaveAttribute('href', 'https://cursor.com');
    expect(github).toBeInTheDocument();
    expect(spotify).toHaveAttribute('href', 'https://open.spotify.com/user/dylangattey');
    expect(cursor.compareDocumentPosition(github) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Favorite albums' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: favoriteAlbumsRoute })).not.toBeInTheDocument();
  });
});

/**
 * @jest-environment jsdom
 */

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

jest.mock('@dg/ui/core/sheet/SheetOpenLink', () => ({
  SheetOpenLink: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

import { interactiveRedesign } from '../../../flags';
import { Footer, RedesignBadge } from '../Footer';

const mockInteractiveRedesign = interactiveRedesign as jest.MockedFunction<
  typeof interactiveRedesign
>;

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

  it('renders the footer shell without awaiting the badge', async () => {
    mockInteractiveRedesign.mockResolvedValue(false);
    render(await Footer());
    expect(screen.getByText(/Dylan Gattey/)).toBeInTheDocument();
    expect(screen.getByText('Listening history')).toBeInTheDocument();
  });
});

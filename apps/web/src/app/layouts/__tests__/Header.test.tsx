import { render, screen } from '@testing-library/react';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
}));

jest.mock('../../../flags', () => ({
  interactiveRedesign: jest.fn(async () => false),
}));

jest.mock('../../../services/spotify', () => ({
  getLatestSong: jest.fn(async () => null),
}));

jest.mock('../SiteHeaderHeight', () => ({
  SiteHeaderHeight: () => null,
}));

jest.mock('../GreenhouseHeader', () => ({
  GreenhouseHeader: () => <div>greenhouse header</div>,
}));

import { Header } from '../Header';

describe('Header', () => {
  it('renders the classic shell without awaiting the redesign flag', () => {
    render(<Header />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.queryByText('greenhouse header')).not.toBeInTheDocument();
  });
});

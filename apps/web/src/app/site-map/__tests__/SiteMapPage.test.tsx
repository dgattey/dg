/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';

jest.mock('next/cache', () => ({
  cacheLife: jest.fn(),
  cacheTag: jest.fn(),
}));

jest.mock('../../../services/contentful', () => ({
  getFooterLinks: jest.fn(async () => [
    { icon: 'github', title: 'Github', url: 'https://github.com/dgattey' },
    { icon: 'x', title: 'X', url: 'https://x.com/dyl_gat' },
  ]),
  getSideProjects: jest.fn(async () => [
    {
      description: 'Personal relationship manager.',
      mark: { height: 128, title: 'Saga', url: 'https://saga.gattey.com/icon.png', width: 128 },
      title: 'Saga',
      url: 'https://saga.gattey.com',
    },
  ]),
}));

import SiteMapPage, { SiteMapDirectory } from '../page';

describe('SiteMapPage', () => {
  it('renders pages, agent surfaces, Dylan apps, and elsewhere links', async () => {
    const directory = await SiteMapDirectory();
    render(
      <>
        <SiteMapPage />
        {directory}
      </>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Site map' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Pages' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Agent and API surfaces' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: "Dylan's apps" })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Elsewhere' })).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'Changelog' })).toHaveAttribute('href', '/changelog');
    expect(screen.getByRole('link', { name: /LLM summary/i })).toHaveAttribute('href', '/llms.txt');
    expect(screen.getByRole('link', { name: /Saga/i })).toHaveAttribute(
      'href',
      'https://saga.gattey.com',
    );
    expect(screen.getByRole('link', { name: /Lost Cities scorer/i })).toHaveAttribute(
      'href',
      'https://lostcities.gattey.com',
    );
  });
});

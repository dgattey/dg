/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';

jest.mock('next/cache', () => ({
  cacheLife: jest.fn(),
  cacheTag: jest.fn(),
}));

jest.mock('../../../services/contentful', () => ({
  getSideProjects: jest.fn(async () => [
    {
      creationDate: '2026-10-01',
      description: 'Personal relationship manager.',
      mark: { height: 128, title: 'Saga', url: 'https://saga.gattey.com/icon.png', width: 128 },
      title: 'Saga',
      url: 'https://saga.gattey.com',
    },
    {
      creationDate: '2026-09-01',
      description: 'Curated photography portfolio.',
      mark: {
        height: 128,
        title: 'Gattey Photos',
        url: 'https://photos.gattey.com/icon.png',
        width: 128,
      },
      title: 'Gattey Photos',
      url: 'https://photos.gattey.com',
    },
  ]),
}));

import SiteMapPage, { SiteMapDirectory } from '../page';

describe('SiteMapPage', () => {
  it('renders pages, Contentful side projects with icons, and agent surfaces without repeating Elsewhere', async () => {
    const directory = await SiteMapDirectory();
    const { container } = render(
      <>
        <SiteMapPage />
        {directory}
      </>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Site map' })).toBeInTheDocument();
    expect(
      screen.getByText('All pages, side projects, and machine-readable endpoints.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Pages' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Side projects' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Agent and API surfaces' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2, name: 'Elsewhere' })).not.toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'Changelog' })).toHaveAttribute('href', '/changelog');
    expect(screen.getByRole('link', { name: /LLM summary/i })).toHaveAttribute('href', '/llms.txt');
    expect(screen.getByRole('link', { name: /Saga/i })).toHaveAttribute(
      'href',
      'https://saga.gattey.com',
    );
    expect(screen.getByRole('link', { name: /Gattey Photos/i })).toHaveAttribute(
      'href',
      'https://photos.gattey.com',
    );
    expect(container.querySelectorAll('[data-role="side-project-mark"]')).toHaveLength(2);
  });
});

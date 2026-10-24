/**
 * @jest-environment jsdom
 */

import type { ChangelogRelease } from '@dg/services/github/fetchReleases';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChangelogLedger } from '../ChangelogLedger';

const SAMPLE_RELEASES: ReadonlyArray<ChangelogRelease> = [
  {
    htmlUrl: 'https://github.com/dgattey/dg/releases/tag/v2.80.1',
    kind: 'patch',
    major: 2,
    minor: 80,
    name: 'v2.80.1',
    notes: ['Extended page cache lifetimes to reduce background revalidation overhead (#661).'],
    patch: 1,
    prNumbers: [661],
    publishedAt: '2026-10-22T17:08:39Z',
    tag: 'v2.80.1',
    version: '2.80.1',
  },
  {
    htmlUrl: 'https://github.com/dgattey/dg/releases/tag/v2.80.0',
    kind: 'minor',
    major: 2,
    minor: 80,
    name: 'v2.80.0',
    notes: [
      'Side projects on the homepage now display live app icons from Sconeos, Saga, and Gattey Photos (#660).',
    ],
    patch: 0,
    prNumbers: [660],
    publishedAt: '2026-10-22T16:26:48Z',
    tag: 'v2.80.0',
    version: '2.80.0',
  },
  {
    htmlUrl: 'https://github.com/dgattey/dg/releases/tag/v2.46.23',
    kind: 'patch',
    major: 2,
    minor: 46,
    name: 'v2.46.23',
    notes: [],
    patch: 23,
    prNumbers: [],
    publishedAt: '2023-12-30T10:04:33Z',
    tag: 'v2.46.23',
    version: '2.46.23',
  },
  {
    htmlUrl: 'https://github.com/dgattey/dg/releases/tag/v2.0.0',
    kind: 'major',
    major: 2,
    minor: 0,
    name: 'v2.0.0',
    notes: ['Starts using Gatsby as source of truth.'],
    patch: 0,
    prNumbers: [],
    publishedAt: '2021-04-27T04:51:23Z',
    tag: 'v2.0.0',
    version: '2.0.0',
  },
];

describe('ChangelogLedger', () => {
  it('renders release totals, featured slips, compact build tags, and filters by kind', async () => {
    const user = userEvent.setup();
    render(<ChangelogLedger releases={SAMPLE_RELEASES} />);

    expect(screen.getByText('Latest')).toBeInTheDocument();
    expect(screen.getByText('Minor & major')).toBeInTheDocument();
    expect(screen.getAllByText('v2.80.1').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('v2.80.0')).toBeInTheDocument();
    expect(screen.getByText('v2.46.23')).toBeInTheDocument();
    expect(screen.getAllByText('v2.0.0').length).toBeGreaterThanOrEqual(2);

    const prLinks = screen.getAllByRole('link', { name: '#660' });
    expect(prLinks[0]).toHaveAttribute('href', 'https://github.com/dgattey/dg/pull/660');

    await user.click(screen.getByRole('button', { name: /Minor/i }));
    expect(screen.getByText('v2.80.0')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'v2.0.0 on GitHub' })).not.toBeInTheDocument();
  });
});

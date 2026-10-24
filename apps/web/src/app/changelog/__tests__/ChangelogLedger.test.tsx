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
    notes: ['Added a Top playlists card with the #1 song from each playlist (#702).'],
    patch: 1,
    prNumbers: [702],
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
    snapshot: {
      height: 900,
      tag: 'v2.46.23',
      title: 'December collage',
      url: 'https://images.ctfassets.net/example/changelog-v2.46.23.webp',
      width: 1200,
    },
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
    expect(screen.getByText('Major & minor')).toBeInTheDocument();
    expect(screen.getByText('First release')).toBeInTheDocument();
    expect(screen.getAllByText('Apr 27, 2021').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('v2.80.1').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('v2.80.0')).toBeInTheDocument();
    expect(screen.getByText('v2.46.23')).toBeInTheDocument();
    expect(screen.getAllByText('v2.0.0').length).toBeGreaterThanOrEqual(1);

    const filterGroup = screen.getByRole('group', { name: 'Filter releases by type' });
    const pillButtons = Array.from(
      filterGroup.querySelectorAll<HTMLButtonElement>(':scope > .paperPill > button'),
    ).map((btn) => btn.textContent?.trim());
    expect(pillButtons).toEqual(['All 4', 'Major 1', 'Minor 1', 'Patch 2']);

    const prLinks = screen.getAllByRole('link', { name: '#660' });
    expect(prLinks[0]).toHaveAttribute('href', 'https://github.com/dgattey/dg/pull/660');
    expect(screen.getByRole('link', { name: '#702' })).toHaveAttribute(
      'href',
      'https://github.com/dgattey/dg/pull/702',
    );
    expect(
      screen.getByText('Added a Top playlists card with the #1 song from each playlist.'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Minor/i }));
    expect(screen.getByText('v2.80.0')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'v2.0.0 on GitHub' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '2021' }));
    expect(screen.getByText('v2.0.0')).toBeInTheDocument();
    expect(screen.queryByText('v2.80.0')).not.toBeInTheDocument();
  });

  it('renders a snapshot polaroid and keeps that release out of the compact ledger', () => {
    render(<ChangelogLedger releases={SAMPLE_RELEASES} />);

    const photo = screen.getByRole('img', { name: 'v2.46.23 — December collage' });
    expect(photo).toHaveAttribute('src', expect.stringContaining('changelog-v2.46.23.webp'));
    expect(screen.getByText('December collage')).toBeInTheDocument();
    expect(screen.queryByText('The collage before the rewrite.')).not.toBeInTheDocument();
    expect(screen.queryByText('Tagged builds in 2023')).not.toBeInTheDocument();
    expect(photo.closest('figure')).toHaveStyle({ rotate: '-2.1deg' });
  });

  it('renders a snapshot without a caption when the asset title is only the version tag', () => {
    const pictured = SAMPLE_RELEASES[2];
    if (!pictured) {
      throw new Error('missing sample release');
    }
    render(
      <ChangelogLedger
        releases={[
          {
            ...pictured,
            notes: [],
            snapshot: {
              height: 900,
              tag: 'v2.46.23',
              title: null,
              url: 'https://images.ctfassets.net/example/changelog-v2.46.23.webp',
              width: 1200,
            },
          },
        ]}
      />,
    );

    expect(screen.getByRole('img', { name: 'v2.46.23 snapshot' })).toBeInTheDocument();
    expect(screen.queryByText('December collage')).not.toBeInTheDocument();
  });
});

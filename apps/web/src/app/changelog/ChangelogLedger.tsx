'use client';

import type { ChangelogRelease } from '@dg/services/github/fetchReleases';
import { startTransition, useState } from 'react';
import { PaperCard } from '../collage/PaperCard';
import { type PaperPillOption, PaperPills } from '../collage/PaperPills';
import { PaperTag } from '../collage/PaperTag';
import { Scallop, Stub } from '../music/stats/StatsShapes';
import { ChangelogReleaseCard } from './ChangelogReleaseCard';
import {
  filterReleases,
  formatReleaseDate,
  groupReleasesByYear,
  RELEASE_KIND_LABELS,
  type ReleaseFilterKey,
  yearTagTreatment,
} from './changelogHelpers';

export function ChangelogLedger({ releases }: { releases: ReadonlyArray<ChangelogRelease> }) {
  const [selectedFilter, setSelectedFilter] = useState<ReleaseFilterKey>('all');

  const latestRelease = releases[0];
  const oldestRelease = releases.at(-1);
  const majorCount = releases.filter((r) => r.kind === 'major').length;
  const minorCount = releases.filter((r) => r.kind === 'minor').length;
  const patchCount = releases.filter((r) => r.kind === 'patch').length;

  const filterOptions: Array<PaperPillOption<ReleaseFilterKey>> = [
    {
      key: 'all',
      label: (
        <>
          All <small>{releases.length}</small>
        </>
      ),
      tiltDeg: -1.5,
    },
    {
      key: 'minor',
      label: (
        <>
          Minor <small>{minorCount}</small>
        </>
      ),
      tiltDeg: 1.2,
    },
    {
      key: 'patch',
      label: (
        <>
          Patch <small>{patchCount}</small>
        </>
      ),
      tiltDeg: -1,
    },
    ...(majorCount > 0
      ? [
          {
            key: 'major' as const,
            label: (
              <>
                Major <small>{majorCount}</small>
              </>
            ),
            tiltDeg: 1.8,
          },
        ]
      : []),
  ];

  const filtered = filterReleases(releases, selectedFilter);
  const yearGroups = groupReleasesByYear(filtered);
  let cardCounter = 0;

  return (
    <div className="changelog__body">
      <ul aria-label="Release totals" className="stats__totals changelog__totals">
        <li>
          <Stub className="stats__total" kind="ticket" tiltDeg={-2} tone="cobalt">
            <span className="changelog__statKey">Current version</span>
            <span className="changelog__statValue">{latestRelease?.tag ?? 'v2.80.1'}</span>
            <span className="changelog__statSub">
              {formatReleaseDate(latestRelease?.publishedAt ?? null) ?? 'Latest cut'}
            </span>
          </Stub>
        </li>
        <li>
          <Scallop className="stats__total" size="seal" tiltDeg={6} tone="vermilion">
            <span className="changelog__statValue">{releases.length}</span>
            <span className="changelog__statKey">Total releases</span>
          </Scallop>
        </li>
        <li>
          <Stub className="stats__total" kind="stamp" tiltDeg={2.2} tone="cream">
            <span className="changelog__statKey">Feature cuts</span>
            <span className="changelog__statValue">{majorCount + minorCount}</span>
            <span className="changelog__statSub">
              {majorCount} major · {minorCount} minor
            </span>
          </Stub>
        </li>
        <li>
          <Stub className="stats__total" kind="ticket" tiltDeg={-1.6} tone="viridian">
            <span className="changelog__statKey">First tagged</span>
            <span className="changelog__statValue">{oldestRelease?.tag ?? 'v1.21.5'}</span>
            <span className="changelog__statSub">
              {formatReleaseDate(oldestRelease?.publishedAt ?? null) ?? 'Archive start'}
            </span>
          </Stub>
        </li>
      </ul>

      <div className="changelog__toolbar">
        <PaperPills
          className="changelog__pills"
          label="Filter releases by type"
          onSelect={(next) => {
            startTransition(() => {
              setSelectedFilter(next);
            });
          }}
          options={filterOptions}
          selected={selectedFilter}
        />
        {yearGroups.length > 1 ? (
          <nav aria-label="Jump to release year" className="changelog__yearNav">
            {yearGroups.map((group, idx) => (
              <a
                className="changelog__yearJump"
                href={`#year-${group.year}`}
                key={group.year}
                style={{ rotate: `${idx % 2 === 0 ? -1.5 : 1.5}deg` }}
              >
                {group.year} <small>{group.totalCount}</small>
              </a>
            ))}
          </nav>
        ) : null}
      </div>

      <div className="changelog__years">
        {yearGroups.map((group, groupIndex) => {
          const yearTag = yearTagTreatment(groupIndex);
          return (
            <section
              aria-label={`${group.year} releases`}
              className="changelog__yearSection"
              id={`year-${group.year}`}
              key={group.year}
            >
              <div className="changelog__yearRail">
                <h2 className="changelog__yearHeading">
                  <PaperTag
                    className="changelog__yearTag"
                    edge="quad-c"
                    tiltDeg={yearTag.tiltDeg}
                    tone={yearTag.tone}
                  >
                    <span>{group.year}</span>
                    <small>
                      {group.totalCount} {group.totalCount === 1 ? 'cut' : 'cuts'}
                    </small>
                  </PaperTag>
                </h2>
              </div>

              <div className="changelog__yearStack">
                {group.featuredReleases.map((release) => {
                  const currentIndex = cardCounter;
                  cardCounter += 1;
                  return (
                    <ChangelogReleaseCard
                      index={currentIndex}
                      isLatest={release.tag === latestRelease?.tag}
                      key={release.tag}
                      release={release}
                    />
                  );
                })}

                {group.compactReleases.length > 0 ? (
                  <PaperCard
                    className="changelog__compactLedger"
                    edge="quad-b"
                    innerClassName="changelog__compactLedgerInner"
                    tiltDeg={groupIndex % 2 === 0 ? 0.4 : -0.4}
                    tone="cream"
                  >
                    <div className="changelog__compactHeader">
                      <span className="changelog__compactTitle">Tagged builds in {group.year}</span>
                      <span className="changelog__compactCount">
                        {group.compactReleases.length}{' '}
                        {group.compactReleases.length === 1 ? 'version' : 'versions'}
                      </span>
                    </div>
                    <ul className="changelog__compactList">
                      {group.compactReleases.map((release) => {
                        const shortDate = formatReleaseDate(release.publishedAt, { short: true });
                        return (
                          <li id={release.tag} key={release.tag}>
                            <a
                              className="changelog__compactChip"
                              data-kind={release.kind}
                              href={release.htmlUrl}
                              rel="noopener noreferrer"
                              target="_blank"
                              title={`${release.tag} (${RELEASE_KIND_LABELS[release.kind]}) on GitHub`}
                            >
                              <span
                                aria-hidden="true"
                                className="changelog__compactDot"
                                data-kind={release.kind}
                              />
                              <span className="changelog__compactTag">{release.tag}</span>
                              {shortDate ? (
                                <span className="changelog__compactDate">{shortDate}</span>
                              ) : null}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </PaperCard>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

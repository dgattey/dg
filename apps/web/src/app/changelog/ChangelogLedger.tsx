'use client';

import type { ChangelogRelease } from '@dg/services/github/fetchReleases';
import { formatUtcShortDate } from '@dg/shared-core/dates/periodStatus';
import { startTransition, useState } from 'react';
import { FilterBar } from '../collage/FilterBar';
import { PaperCard } from '../collage/PaperCard';
import { type PaperPillOption, PaperPills } from '../collage/PaperPills';
import { PaperTag } from '../collage/PaperTag';
import { YearMenu } from '../collage/YearMenu';
import { Scallop, Stub } from '../music/stats/StatsShapes';
import { ChangelogReleaseCard } from './ChangelogReleaseCard';
import {
  extractReleaseYear,
  filterReleases,
  groupReleasesByYear,
  RELEASE_KIND_LABELS,
  type ReleaseFilter,
  type ReleaseFilterKey,
  yearTagTreatment,
} from './changelogHelpers';

export function ChangelogLedger({ releases }: { releases: ReadonlyArray<ChangelogRelease> }) {
  const [selectedFilter, setSelectedFilter] = useState<ReleaseFilter>('all');

  const latestRelease = releases[0];
  const oldestRelease = releases.at(-1);
  const majorCount = releases.filter((r) => r.kind === 'major').length;
  const minorCount = releases.filter((r) => r.kind === 'minor').length;
  const patchCount = releases.filter((r) => r.kind === 'patch').length;
  const availableYears = [
    ...new Set(
      releases
        .map((release) => Number(extractReleaseYear(release)))
        .filter((year) => Number.isFinite(year)),
    ),
  ].sort((a, b) => b - a);

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
  ];

  const filtered = filterReleases(releases, selectedFilter);
  const yearGroups = groupReleasesByYear(filtered);
  let cardCounter = 0;

  return (
    <div className="changelog__body">
      <ul aria-label="Release totals" className="stats__totals changelog__totals">
        <li>
          <Stub className="stats__total" kind="ticket" tiltDeg={-2} tone="cobalt">
            <span className="changelog__statKey" data-typography="meta">
              Current version
            </span>
            <span data-typography="stat-lg">{latestRelease?.tag ?? 'v2.80.1'}</span>
            <span className="changelog__statSub" data-typography="caption">
              {formatUtcShortDate(latestRelease?.publishedAt) ?? 'Latest release'}
            </span>
          </Stub>
        </li>
        <li>
          <Scallop className="stats__total" size="seal" tiltDeg={6} tone="vermilion">
            <span data-typography="stat-lg">{releases.length}</span>
            <span className="changelog__statKey" data-typography="meta">
              Total releases
            </span>
          </Scallop>
        </li>
        <li>
          <Stub className="stats__total" kind="stamp" tiltDeg={2.2} tone="cream">
            <span className="changelog__statKey" data-typography="meta">
              Major &amp; minor
            </span>
            <span data-typography="stat-lg">{majorCount + minorCount}</span>
            <span className="changelog__statSub" data-typography="caption">
              {majorCount} major · {minorCount} minor
            </span>
          </Stub>
        </li>
        <li>
          <Stub className="stats__total" kind="ticket" tiltDeg={-1.6} tone="viridian">
            <span className="changelog__statKey" data-typography="meta">
              First release
            </span>
            <span data-typography="stat-md">
              {formatUtcShortDate(oldestRelease?.publishedAt) ?? 'Earliest release'}
            </span>
          </Stub>
        </li>
      </ul>

      <FilterBar variant="start">
        <PaperPills
          label="Filter releases by type"
          onSelect={(next) => {
            startTransition(() => {
              setSelectedFilter(next);
            });
          }}
          options={filterOptions}
          selected={typeof selectedFilter === 'number' ? null : selectedFilter}
        >
          {availableYears.length > 1 ? (
            <YearMenu
              onPick={(year) => {
                startTransition(() => {
                  setSelectedFilter(year);
                });
              }}
              selected={typeof selectedFilter === 'number' ? selectedFilter : null}
              years={availableYears}
            />
          ) : null}
        </PaperPills>
      </FilterBar>

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
                    variant="title-md"
                  >
                    <span>{group.year}</span>
                    <small>
                      {group.totalCount} {group.totalCount === 1 ? 'release' : 'releases'}
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
                    edge="quad-b"
                    innerClassName="changelog__compactLedgerInner"
                    tiltDeg={groupIndex % 2 === 0 ? 0.4 : -0.4}
                    tone="cream"
                  >
                    <div className="changelog__compactHeader">
                      <span data-typography="label">Tagged builds in {group.year}</span>
                      <span className="changelog__compactCount" data-typography="meta">
                        {group.compactReleases.length}{' '}
                        {group.compactReleases.length === 1 ? 'version' : 'versions'}
                      </span>
                    </div>
                    <ul className="changelog__compactList">
                      {group.compactReleases.map((release) => {
                        const shortDate = formatUtcShortDate(release.publishedAt, {
                          withYear: false,
                        });
                        return (
                          <li id={release.tag} key={release.tag}>
                            <a
                              className="changelog__compactChip"
                              data-kind={release.kind}
                              data-typography="badge"
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
                              <span>{release.tag}</span>
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

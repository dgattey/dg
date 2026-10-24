import type { ChangelogRelease } from '@dg/services/github/fetchReleases';
import Image from 'next/image';
import { PaperCard } from '../collage/PaperCard';
import { PaperTag } from '../collage/PaperTag';
import {
  formatReleaseDate,
  formatReleaseNote,
  githubPullRequestUrl,
  RELEASE_KIND_LABELS,
  RELEASE_KIND_TONES,
  releaseCardTreatment,
  snapshotPolaroidTreatment,
} from './changelogHelpers';

export function ChangelogReleaseCard({
  index,
  isLatest,
  release,
}: {
  index: number;
  isLatest: boolean;
  release: ChangelogRelease;
}) {
  const { edge, tiltDeg } = releaseCardTreatment(index);
  const formattedDate = formatReleaseDate(release.publishedAt);
  const kindTone = RELEASE_KIND_TONES[release.kind];
  const kindLabel = RELEASE_KIND_LABELS[release.kind];
  const snapshot = release.snapshot;
  const polaroidTilt = snapshotPolaroidTreatment(index).tiltDeg;

  return (
    <article className="changelog__entry" id={release.tag}>
      <PaperCard
        edge={edge}
        innerClassName="changelog__cardInner"
        tag={
          isLatest ? (
            <PaperTag
              className="collagePin changelog__latestPin"
              edge="quad-b"
              tiltDeg={3}
              tone="ochre"
            >
              Latest
            </PaperTag>
          ) : undefined
        }
        tiltDeg={tiltDeg}
        tone="cream"
      >
        <div className="changelog__cardBody" data-has-snapshot={snapshot ? 'true' : undefined}>
          <div className="changelog__cardCopy">
            <header className="changelog__cardHeader">
              <div className="changelog__versionCluster">
                <PaperTag
                  className="changelog__versionTag"
                  edge="quad-c"
                  tiltDeg={index % 2 === 0 ? -1.5 : 1.5}
                  tone={kindTone}
                >
                  {release.tag}
                </PaperTag>
                <span className="changelog__kindBadge" data-kind={release.kind}>
                  {kindLabel}
                </span>
                {formattedDate ? (
                  <time className="changelog__date" dateTime={release.publishedAt ?? undefined}>
                    {formattedDate}
                  </time>
                ) : null}
              </div>
              <div className="changelog__linksCluster">
                {release.prNumbers.map((prNum) => (
                  <a
                    className="changelog__prChip"
                    href={githubPullRequestUrl(prNum)}
                    key={prNum}
                    rel="noopener noreferrer"
                    target="_blank"
                    title={`Pull request #${prNum}`}
                  >
                    #{prNum}
                  </a>
                ))}
                <a
                  aria-label={`${release.tag} on GitHub`}
                  className="changelog__githubLink"
                  href={release.htmlUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  GitHub <span aria-hidden="true">↗</span>
                </a>
              </div>
            </header>
            {release.notes.length > 0 ? (
              <ul className="changelog__notes">
                {release.notes.map((note) => (
                  <li className="changelog__noteItem" key={note}>
                    {formatReleaseNote(note)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="changelog__emptyNote">
                {release.kind === 'major'
                  ? 'Major milestone release.'
                  : 'Maintenance and dependency updates.'}
              </p>
            )}
          </div>
          {snapshot ? (
            <figure className="changelog__polaroid" style={{ rotate: `${polaroidTilt}deg` }}>
              <div className="changelog__polaroidFrame">
                <Image
                  alt={
                    snapshot.title
                      ? `${release.tag} — ${snapshot.title}`
                      : `${release.tag} snapshot`
                  }
                  className="changelog__polaroidImg"
                  height={snapshot.height}
                  sizes="(max-width: 760px) 100vw, 340px"
                  src={snapshot.url}
                  width={snapshot.width}
                />
              </div>
              {snapshot.title ? (
                <figcaption className="changelog__polaroidCaption">
                  <span className="changelog__polaroidTitle">{snapshot.title}</span>
                </figcaption>
              ) : null}
            </figure>
          ) : null}
        </div>
      </PaperCard>
    </article>
  );
}

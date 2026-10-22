import type { ChangelogRelease } from '@dg/services/github/fetchReleases';
import { PaperCard } from '../collage/PaperCard';
import { PaperTag } from '../collage/PaperTag';
import {
  formatReleaseDate,
  githubPullRequestUrl,
  RELEASE_KIND_LABELS,
  RELEASE_KIND_TONES,
  releaseCardTreatment,
  tokenizeNoteLine,
} from './changelogHelpers';

function NoteLine({ line }: { line: string }) {
  const tokens = tokenizeNoteLine(line);
  return (
    <>
      {tokens.map((token, idx) => {
        const key = `${idx}-${token.kind}`;
        switch (token.kind) {
          case 'bold':
            return <strong key={key}>{token.value}</strong>;
          case 'code':
            return (
              <code className="changelog__code" key={key}>
                {token.value}
              </code>
            );
          case 'pr':
            return (
              <a
                className="changelog__prInline"
                href={token.href}
                key={key}
                rel="noopener noreferrer"
                target="_blank"
              >
                {token.label}
              </a>
            );
          case 'text':
            return <span key={key}>{token.value}</span>;
          default: {
            const exhaustive: never = token;
            return exhaustive;
          }
        }
      })}
    </>
  );
}

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

  return (
    <article className="changelog__entry" id={release.tag}>
      <PaperCard
        className="changelog__card"
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
                <NoteLine line={note} />
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
      </PaperCard>
    </article>
  );
}

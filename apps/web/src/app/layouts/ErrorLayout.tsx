import { homeRoute } from '@dg/shared-core/routes/app';
import { Typography } from '@dg/ui/core/Typography';
import { NOT_FOUND_BACKDROP, SERVER_ERROR_BACKDROP } from '../collage/backdrops';
import { CollageBackdrop } from '../collage/CollageBackdrop';
import { CutLetters } from '../collage/CutLetters';
import { PaperButton } from '../collage/PaperButton';
import { PaperCard } from '../collage/PaperCard';

type ErrorLayoutProps = {
  statusCode: number;
};

const ERROR_COPY = {
  404: {
    detail: 'Email me if something is wrong.',
    heading: 'Sorry, couldn‘t find that page.',
  },
  other: {
    detail: 'Email me if it keeps happening.',
    heading: 'Something went wrong on my end.',
  },
} as const;

export function ErrorLayout({ statusCode }: ErrorLayoutProps) {
  const copy = statusCode === 404 ? ERROR_COPY[404] : ERROR_COPY.other;

  return (
    <section
      aria-label={String(statusCode)}
      className="collageBleed collageBackdropHost error__sheet"
    >
      <CollageBackdrop backdrop={statusCode === 404 ? NOT_FOUND_BACKDROP : SERVER_ERROR_BACKDROP} />
      <div className="error__content">
        <CutLetters className="error__statusCode" cut={true} text={String(statusCode)} />
        <PaperCard
          className="error__messageCard"
          edge="quad-b"
          innerClassName="error__messageCardInner"
          tiltDeg={-1.2}
        >
          <Typography component="h2" variant="h3">
            {copy.heading}
          </Typography>
          <Typography>{copy.detail}</Typography>
        </PaperCard>
        <PaperButton href={homeRoute} tiltDeg={2} title="Home" tone="ochre">
          Back home
        </PaperButton>
      </div>
    </section>
  );
}

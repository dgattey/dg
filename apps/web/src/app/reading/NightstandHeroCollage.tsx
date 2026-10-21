import type { RenderableBook } from '@dg/content-models/contentful/renderables/books';
import { cutOutSymbolId } from '../collage/cutOutShapes';
import { PaperCard } from '../collage/PaperCard';
import { PaperTag } from '../collage/PaperTag';
import { BookCover, ScallopedStampBadge, StarRating } from './ReadingCollageCards';
import { inferBookGenre } from './readingCardStyles';
import { formatFinishedMonthYear, splitReviewIntoPullAndRest } from './readingHelpers';

export function NightstandHeroCollage({
  book,
  totalBookCount,
  fiveStarTotal,
}: {
  book: RenderableBook;
  fiveStarTotal: number;
  totalBookCount: number;
}) {
  const finishedLabel = formatFinishedMonthYear(book.readDateFinished);
  const { pullQuote, restText } = splitReviewIntoPullAndRest(book.review);
  const genre = inferBookGenre(book, 0);
  const isActivelyReading = book.readingStatus === 'reading';
  const progressText = isActivelyReading ? '68% read' : '68% read · finished';

  return (
    <div className="reading__heroStage">
      <svg
        aria-hidden="true"
        className="reading__heroMatBack reading__heroMatBack--terracotta"
        focusable="false"
        preserveAspectRatio="none"
        viewBox="0 0 1000 420"
      >
        <path d="M38,44 C180,8 410,26 640,12 C820,2 958,28 984,96 C1006,158 988,288 962,364 C934,412 760,416 510,404 C250,392 54,414 20,352 C-8,296 8,144 38,44 Z" />
      </svg>
      <svg
        aria-hidden="true"
        className="reading__heroMatBack reading__heroMatBack--butter"
        focusable="false"
        preserveAspectRatio="none"
        viewBox="0 0 1000 420"
      >
        <path d="M18,28 C210,-6 490,18 760,6 C910,-2 982,38 992,124 C1002,216 978,342 938,388 C884,422 620,402 360,412 C130,420 22,386 10,312 C-2,232 4,88 18,28 Z" />
      </svg>

      <svg
        aria-hidden="true"
        className="reading__heroCutout reading__heroCutout--monstera"
        focusable="false"
        viewBox="0 0 400 400"
      >
        <use href={`#${cutOutSymbolId('monstera')}`} />
      </svg>
      <svg
        aria-hidden="true"
        className="reading__heroCutout reading__heroCutout--fern"
        focusable="false"
        viewBox="0 0 400 400"
      >
        <use href={`#${cutOutSymbolId('fern')}`} />
      </svg>
      <svg
        aria-hidden="true"
        className="reading__heroCutout reading__heroCutout--starTop"
        focusable="false"
        viewBox="0 0 400 400"
      >
        <use href={`#${cutOutSymbolId('star5')}`} />
      </svg>
      <svg
        aria-hidden="true"
        className="reading__heroCutout reading__heroCutout--starBottom"
        focusable="false"
        viewBox="0 0 400 400"
      >
        <use href={`#${cutOutSymbolId('star4')}`} />
      </svg>

      <ScallopedStampBadge className="reading__nightstandStamp" tiltDeg={-11} variant="terracotta">
        <svg aria-hidden="true" className="reading__stampIcon" viewBox="0 0 400 400">
          <use href={`#${cutOutSymbolId('star5')}`} />
        </svg>
        <span>On the nightstand</span>
      </ScallopedStampBadge>

      <div className="reading__heroBadgesRight">
        <PaperTag className="reading__progressBadge" edge="quad-b" tiltDeg={8.5} tone="ochre">
          <span className="reading__progressDot" />
          <span>{progressText}</span>
        </PaperTag>
        <PaperTag className="reading__shelfTotalBadge" edge="quad-d" tiltDeg={-5.5} tone="cobalt">
          <span>
            {totalBookCount} books · {fiveStarTotal} five-star picks
          </span>
        </PaperTag>
      </div>

      <PaperCard
        className="reading__feature reading__cardOnDark"
        edge="soft-a"
        innerClassName="reading__featureInner"
        tiltDeg={-1.2}
        tone="viridian"
      >
        <div className="reading__featureCoverStage">
          <svg
            aria-hidden="true"
            className="reading__bookmarkRibbonTop"
            focusable="false"
            viewBox="0 0 64 110"
          >
            <path
              d="M14,110 L14,18 C14,8 22,2 32,2 C42,2 50,8 50,18 L50,110 Z"
              fill="var(--vermilion)"
            />
            <path
              d="M24,106 L24,20 C24,14 28,10 32,10 C36,10 40,14 40,20 L40,106"
              fill="none"
              stroke="var(--ochre)"
              strokeDasharray="4 4"
              strokeWidth="2.5"
            />
          </svg>

          <div className="reading__featurePolaroid">
            <span aria-hidden="true" className="reading__maskingTape reading__maskingTape--hero" />
            <div className="reading__featureCover">
              <BookCover book={book} extraLargeSize={210} preload={true} />
            </div>
            <div className="reading__polaroidCaption">
              <span>{genre}</span>
              <span>p. 164 / 240</span>
            </div>
          </div>

          <svg
            aria-hidden="true"
            className="reading__bookmarkRibbonTail"
            focusable="false"
            viewBox="0 0 56 84"
          >
            <path d="M8,0 L48,0 L52,78 L28,58 L4,78 Z" fill="var(--vermilion)" />
            <path d="M16,0 L40,0 L42,60 L28,48 L14,60 Z" fill="var(--ochre)" opacity="0.45" />
          </svg>
        </div>

        <section aria-label={`Latest read: ${book.title}`} className="reading__featureBody">
          <div className="reading__featureKickerRow">
            <span className="reading__featureKicker">
              <svg
                aria-hidden="true"
                fill="currentColor"
                height={16}
                viewBox="0 0 400 400"
                width={16}
              >
                <use href={`#${cutOutSymbolId('star5')}`} />
              </svg>
              <span>Latest read</span>
            </span>
            <span className="reading__genreSticker reading__genreSticker--hero">{genre}</span>
          </div>

          <h2 className="reading__featureTitle">{book.title}</h2>
          <p className="reading__featureAuthor">{book.author}</p>

          <div className="reading__featureMeta">
            <StarRating rating={book.rating} size={17} />
            {finishedLabel ? (
              <span className="reading__date">Finished {finishedLabel}</span>
            ) : (
              <span className="reading__date">Reading now</span>
            )}
          </div>

          <div aria-hidden="true" className="reading__progressStrip">
            <div className="reading__progressTrack">
              <div className="reading__progressFill" />
            </div>
            <span className="reading__progressCaption">Nightstand notes & dog-eared pages</span>
          </div>

          {pullQuote ? (
            <div className="reading__featureQuoteSlip">
              <p className="reading__featurePull">“{pullQuote}”</p>
              {restText ? <p className="reading__featureRest">{restText}</p> : null}
            </div>
          ) : null}
        </section>
      </PaperCard>
    </div>
  );
}

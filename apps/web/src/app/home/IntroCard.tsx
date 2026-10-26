import type { IntroContent } from '@dg/content-models/contentful/renderables/intro';
import type { RenderableLink } from '@dg/content-models/contentful/renderables/links';
import { RichText } from '@dg/ui/dependent/RichText';
import { CutLetters } from '../collage/CutLetters';
import { PortraitPrint } from '../collage/PortraitPrint';
import { splitIntroDocument } from '../collage/splitIntroDocument';

type IntroCardProps = {
  linkedInLink: RenderableLink | null;
  introBlock: IntroContent;
};

export function IntroCard({ introBlock, linkedInLink }: IntroCardProps) {
  const { headline, remainder } = splitIntroDocument(introBlock.textBlock.content);

  return (
    <>
      <PortraitPrint
        className="home__portraitSlot"
        image={introBlock.image}
        linkedInLink={linkedInLink}
      />
      {headline ? (
        <CutLetters
          className="collagePageTitle home__headline"
          text={headline}
          variant="display-hero"
        />
      ) : null}
      <div className="home__intro" data-typography="prose-lg">
        <RichText {...remainder} variant="prose-lg" />
      </div>
    </>
  );
}

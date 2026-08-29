import type { IntroContent } from '@dg/content-models/contentful/renderables/intro';
import type { RenderableLink } from '@dg/content-models/contentful/renderables/links';
import { RichText } from '@dg/ui/dependent/RichText';
import { CutLetters } from './CutLetters';
import styles from './HelloSheet.module.css';
import { PaperCard } from './PaperCard';
import { PortraitPrint } from './PortraitPrint';
import { splitIntroDocument } from './splitIntroDocument';

type CollageIntroProps = {
  introBlock: IntroContent;
  linkedInLink: RenderableLink | null;
};

export function CollageIntro({ introBlock, linkedInLink }: CollageIntroProps) {
  const { headline, remainder } = splitIntroDocument(introBlock.textBlock.content);

  return (
    <>
      <PortraitPrint
        className={styles.portrait}
        image={introBlock.image}
        linkedInLink={linkedInLink}
      />
      {headline ? <CutLetters className={styles.headline} text={headline} /> : null}
      <PaperCard
        className={styles.intro}
        edge="quad-a"
        innerClassName={styles.introInner}
        tiltDeg={-1}
        tone="cream"
      >
        <RichText {...remainder} />
      </PaperCard>
    </>
  );
}

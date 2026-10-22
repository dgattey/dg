import 'server-only';
import './devConsole.css';

import type { ReactNode } from 'react';
import { DEV_CONSOLE_BACKDROP } from '../collage/backdrops';
import { CollageBackdrop } from '../collage/CollageBackdrop';
import { CutLetters } from '../collage/CutLetters';
import { PaperCard } from '../collage/PaperCard';
import { PaperTag } from '../collage/PaperTag';
import type { PaperTone } from '../collage/types';
import { OauthCard } from './oauth/OauthCard';
import { VercelSignInCard } from './vercel/VercelSignInCard';
import { WebhookCard } from './webhooks/WebhookCard';

function Section({
  children,
  sectionId,
  tiltDeg,
  title,
  tone,
}: {
  children: ReactNode;
  sectionId: string;
  tiltDeg: number;
  title: string;
  tone: PaperTone;
}) {
  return (
    <section aria-labelledby={`dev-console-${sectionId}`} className="devConsole__section">
      <PaperTag className="collageEyebrow devConsole__sectionTitle" tiltDeg={tiltDeg} tone={tone}>
        <span id={`dev-console-${sectionId}`}>{title}</span>
      </PaperTag>
      <div className="devConsole__cards">{children}</div>
    </section>
  );
}

type ConsolePageProps = {
  searchParams?: Promise<Record<string, string | Array<string> | undefined>>;
};

/**
 * Dev console shell. Keep this sync — await `searchParams` / cookies only inside
 * Suspense boundaries (see VercelSignInCard) so the route can prerender.
 */
export default function ConsolePage({ searchParams }: ConsolePageProps) {
  return (
    <section
      aria-label="Dev console"
      className="collageBleed collageBackdropHost devConsole__sheet"
    >
      <CollageBackdrop backdrop={DEV_CONSOLE_BACKDROP} />
      <div className="collageMeasure devConsole__grid">
        <div className="devConsole__header">
          <CutLetters className="collagePageTitle devConsole__title" text="Dev console" />
          <PaperCard
            className="devConsole__lede"
            edge="quad-c"
            innerClassName="devConsole__ledeInner"
            tag={
              <PaperTag className="collagePin devConsole__protectedTag" tiltDeg={-3} tone="rose">
                Protected <small>basic auth</small>
              </PaperTag>
            }
            tiltDeg={1}
          >
            <p>This page is protected and intended for developer access.</p>
          </PaperCard>
        </div>
        <div className="devConsole__console">
          <Section
            sectionId="OAuth-connections"
            tiltDeg={-2}
            title="OAuth connections"
            tone="vermilion"
          >
            <OauthCard provider="strava" />
            <OauthCard provider="spotify" />
          </Section>
          <Section
            sectionId="Flags-identity"
            tiltDeg={1.5}
            title="Flags identity"
            tone="ultramarine"
          >
            <VercelSignInCard searchParams={searchParams} />
          </Section>
          <Section sectionId="Tools" tiltDeg={-1} title="Tools" tone="black">
            <WebhookCard />
          </Section>
        </div>
      </div>
    </section>
  );
}

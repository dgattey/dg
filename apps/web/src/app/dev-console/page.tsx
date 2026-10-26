import 'server-only';
import './devConsole.css';

import { type ReactNode, Suspense } from 'react';
import { isDevConsoleAuthenticated } from '../../auth/vercel/getVercelSession';
import { DEV_CONSOLE_BACKDROP } from '../collage/backdrops';
import { CollageBackdrop } from '../collage/CollageBackdrop';
import { CutLetters } from '../collage/CutLetters';
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

export async function DevConsoleBody({ searchParams }: ConsolePageProps = {}) {
  const isAuthenticated = await isDevConsoleAuthenticated();

  if (!isAuthenticated) {
    return (
      <Section sectionId="Access" tiltDeg={-1.5} title="Access" tone="ultramarine">
        <VercelSignInCard searchParams={searchParams} />
      </Section>
    );
  }

  return (
    <>
      <Section
        sectionId="OAuth-connections"
        tiltDeg={-2}
        title="OAuth connections"
        tone="vermilion"
      >
        <OauthCard provider="strava" />
        <OauthCard provider="spotify" />
      </Section>
      <Section sectionId="Access" tiltDeg={1.5} title="Access" tone="ultramarine">
        <VercelSignInCard searchParams={searchParams} />
      </Section>
      <Section sectionId="Tools" tiltDeg={-1} title="Tools" tone="black">
        <WebhookCard />
      </Section>
    </>
  );
}

/**
 * Dev console shell. Keep this sync — await `searchParams` / cookies only inside
 * Suspense boundaries (see DevConsoleBody) so the route can prerender.
 */
export default function ConsolePage({ searchParams }: ConsolePageProps) {
  return (
    <section
      aria-label="Dev console"
      className="collageBleed collageBackdropHost devConsole__sheet"
    >
      <CollageBackdrop backdrop={DEV_CONSOLE_BACKDROP} />
      <div className="collageMeasure devConsole__grid">
        <CutLetters className="collagePageTitle" text="Dev console" />
        <div className="devConsole__console">
          <Suspense fallback={null}>
            <DevConsoleBody searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}

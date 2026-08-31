import { Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { CutLetters } from '../../collage/CutLetters';
import { CutOut } from '../../collage/CutOut';
import { CutOutSymbols } from '../../collage/CutOutSymbols';
import { CUT_OUT_PLACEMENTS } from '../../collage/cutOutPlacements';
import { PaperCard } from '../../collage/PaperCard';
import { PaperTag } from '../../collage/PaperTag';
import type { PaperTone } from '../../collage/types';
import styles from './devConsole.module.css';
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
    <section aria-labelledby={`dev-console-${sectionId}`} className={styles.section}>
      <PaperTag className={`collageEyebrow ${styles.sectionTitle}`} tiltDeg={tiltDeg} tone={tone}>
        <span id={`dev-console-${sectionId}`}>{title}</span>
      </PaperTag>
      <div className={styles.cards}>{children}</div>
    </section>
  );
}

export function CollageConsole({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | Array<string> | undefined>>;
}) {
  return (
    <main className={`collageBleed ${styles.sheet}`}>
      <CutOutSymbols />
      {CUT_OUT_PLACEMENTS.devConsole.map((placement) => (
        <CutOut key={placement.id} placement={placement} />
      ))}
      <div className={`collageMeasure ${styles.grid}`}>
        <div className={styles.header}>
          <CutLetters className={`collagePageTitle ${styles.title}`} text="Dev console" />
          <PaperCard
            className={styles.lede}
            edge="quad-c"
            innerClassName={styles.ledeInner}
            tag={
              <PaperTag className={`collagePin ${styles.protectedTag}`} tiltDeg={-3} tone="rose">
                Protected <small>basic auth</small>
              </PaperTag>
            }
            tiltDeg={1}
          >
            <Typography>This page is protected and intended for developer access.</Typography>
          </PaperCard>
        </div>
        <div className={styles.console}>
          <Section
            sectionId="OAuth-connections"
            tiltDeg={-2}
            title="OAuth connections"
            tone="vermilion"
          >
            <OauthCard provider="strava" surface="collage" />
            <OauthCard provider="spotify" surface="collage" />
          </Section>
          <Section
            sectionId="Flags-identity"
            tiltDeg={1.5}
            title="Flags identity"
            tone="ultramarine"
          >
            <VercelSignInCard searchParams={searchParams} surface="collage" />
          </Section>
          <Section sectionId="Tools" tiltDeg={-1} title="Tools" tone="black">
            <WebhookCard surface="collage" />
          </Section>
        </div>
      </div>
    </main>
  );
}

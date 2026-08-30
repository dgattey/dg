import 'server-only';

import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { Box, Divider, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { CutLetters } from '../../collage/CutLetters';
import { CutOut } from '../../collage/CutOut';
import { CutOutSymbols } from '../../collage/CutOutSymbols';
import type { CutOutPlacement } from '../../collage/cutOutPlacements';
import { PaperCard } from '../../collage/PaperCard';
import { PaperTag } from '../../collage/PaperTag';
import styles from './devConsole.module.css';
import { OauthCard } from './oauth/OauthCard';
import { VercelSignInCard } from './vercel/VercelSignInCard';
import { WebhookCard } from './webhooks/WebhookCard';

const oauthProviders = ['strava', 'spotify'] as const;

const DEV_CONSOLE_CUT_OUTS = [
  {
    color: 'star',
    id: 'dev-console-star',
    rotationDeg: 12,
    shape: 'star5',
    sizePx: 44,
    visibility: 'desktop',
    xPercent: 58,
    yPercent: 4,
    zIndex: 3,
  },
  {
    color: 'leaf',
    id: 'dev-console-algae-upper',
    rotationDeg: -20,
    shape: 'algae',
    sizePx: 170,
    visibility: 'desktop',
    xPercent: 88,
    yPercent: 0,
    zIndex: 1,
  },
  {
    color: 'leaf',
    id: 'dev-console-algae-lower',
    rotationDeg: 16,
    shape: 'algae',
    sizePx: 220,
    visibility: 'desktop',
    xPercent: 68,
    yPercent: 82,
    zIndex: 1,
  },
] as const satisfies ReadonlyArray<CutOutPlacement>;

function PageHeader({ surface }: { surface: SiteSurface }) {
  if (surface === 'collage') {
    return (
      <div className={styles.header}>
        <CutLetters className={`collagePageTitle ${styles.title}`} text="Dev console" />
        <PaperCard
          className={styles.lede}
          edge="quad-c"
          innerClassName={styles.ledeInner}
          tag={
            <PaperTag className={styles.protectedTag} tiltDeg={-3} tone="rose">
              Protected <small>basic auth</small>
            </PaperTag>
          }
          tiltDeg={1}
        >
          <Typography>This page is protected and intended for developer access.</Typography>
        </PaperCard>
      </div>
    );
  }

  return (
    <Stack
      sx={{
        gap: 2,
      }}
    >
      <Typography variant="h1">Dev console</Typography>
      <Typography
        sx={{
          color: 'text.secondary',
        }}
        variant="body1"
      >
        This page is protected and intended for developer access.
      </Typography>
      <Divider sx={{ marginBlockStart: 2 }} />
    </Stack>
  );
}

const SECTION_TONES = {
  'Flags identity': 'ultramarine',
  'OAuth connections': 'vermilion',
  Tools: 'black',
} as const;

function CardSection({
  title,
  children,
  surface,
}: {
  title: keyof typeof SECTION_TONES;
  children: ReactNode;
  surface: SiteSurface;
}) {
  if (surface === 'collage') {
    return (
      <section
        aria-labelledby={`dev-console-${title.replaceAll(' ', '-')}`}
        className={styles.section}
      >
        <PaperTag
          className={styles.sectionTitle}
          tiltDeg={title === 'Flags identity' ? 1.5 : title === 'Tools' ? -1 : -2}
          tone={SECTION_TONES[title]}
        >
          <span id={`dev-console-${title.replaceAll(' ', '-')}`}>{title}</span>
        </PaperTag>
        <div className={styles.cards}>{children}</div>
      </section>
    );
  }

  return (
    <Stack
      sx={{
        gap: 3,
      }}
    >
      <Typography variant="h2">{title}</Typography>
      <Box
        sx={{
          alignItems: 'flex-start',
          display: 'grid',
          gap: 4,
          gridTemplateColumns: {
            sm: 'repeat(2, minmax(280px, 1fr))',
            xs: '1fr',
          },
        }}
      >
        {children}
      </Box>
    </Stack>
  );
}

type ConsolePageProps = {
  searchParams?: Promise<Record<string, string | Array<string> | undefined>>;
  surface?: SiteSurface;
};

/**
 * Dev console shell. Keep this sync — await `searchParams` / cookies only inside
 * Suspense boundaries (see VercelSignInCard) so the route can prerender.
 */
export default function ConsolePage({ searchParams, surface = 'classic' }: ConsolePageProps) {
  const sections = (
    <>
      <CardSection surface={surface} title="OAuth connections">
        {oauthProviders.map((provider) => (
          <OauthCard key={provider} provider={provider} surface={surface} />
        ))}
      </CardSection>

      <CardSection surface={surface} title="Flags identity">
        <VercelSignInCard searchParams={searchParams} surface={surface} />
      </CardSection>

      <CardSection surface={surface} title="Tools">
        <WebhookCard surface={surface} />
      </CardSection>
    </>
  );

  if (surface === 'collage') {
    return (
      <main className={styles.sheet}>
        <CutOutSymbols />
        {DEV_CONSOLE_CUT_OUTS.map((placement) => (
          <CutOut key={placement.id} placement={placement} />
        ))}
        <div className={styles.grid}>
          <PageHeader surface={surface} />
          <div className={styles.console}>{sections}</div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Stack
        sx={{
          gap: 6,
        }}
      >
        <PageHeader surface={surface} />
        {sections}
      </Stack>
    </main>
  );
}

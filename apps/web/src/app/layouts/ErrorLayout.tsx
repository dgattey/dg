'use client';

import { homeRoute } from '@dg/shared-core/routes/app';
import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { MouseAwareGlassContainer } from '@dg/ui/core/MouseAwareGlassContainer';
import { Section } from '@dg/ui/core/Section';
import { Link } from '@dg/ui/dependent/Link';
import type { SxObject } from '@dg/ui/theme';
import { BRAND } from '@dg/ui/theme/color';
import { Stack, Typography } from '@mui/material';
import { CutLetters } from '../collage/CutLetters';
import { CutOut } from '../collage/CutOut';
import { CutOutSymbols } from '../collage/CutOutSymbols';
import { CUT_OUT_PLACEMENTS } from '../collage/cutOutPlacements';
import { PaperButton } from '../collage/PaperButton';
import { PaperCard } from '../collage/PaperCard';
import styles from './error.module.css';

type ErrorLayoutProps = {
  /**
   * The numeric code for the error's status
   */
  statusCode: number;
  surface?: SiteSurface;
};

const layoutSx: SxObject = {
  alignItems: 'center',
  gap: 3,
  marginTop: -8,
};

const statusCodeSx: SxObject = {
  filter: `drop-shadow(2px 2px 12px ${BRAND.secondaryShadow})`,
  flexShrink: 1,
  fontSize: { md: '280px', sm: '200px', xs: '140px' },
  fontStretch: 'extra-expanded',
  fontWeight: 900,
  textWrap: 'nowrap',
};

const messageSx: SxObject = {
  maxWidth: '26em',
  textAlign: 'center',
  textWrap: 'balance',
};

const backLinkSx: SxObject = {
  marginTop: 3,
};

const ERROR_COPY = {
  404: {
    classic: 'Sorry, couldn‘t find that page. Email me if something is wrong.',
    detail: 'Email me if something is wrong.',
    heading: 'Sorry, couldn‘t find that page.',
  },
  other: {
    classic: 'Something went super wrong, sorry. Email me to let me know.',
    detail: 'Email me if it keeps happening.',
    heading: 'Something went wrong on my end.',
  },
} as const;

/**
 * Basic page layout for error pages. Max-width'd content, left aligned,
 * with a go home button at the bottom
 */
export function ErrorLayout({ statusCode, surface = 'classic' }: ErrorLayoutProps) {
  const copy = statusCode === 404 ? ERROR_COPY[404] : ERROR_COPY.other;

  if (surface === 'collage') {
    return (
      <section aria-label={String(statusCode)} className={`collageBleed ${styles.sheet}`}>
        <CutOutSymbols />
        {CUT_OUT_PLACEMENTS.error.map((placement) => (
          <CutOut key={placement.id} placement={placement} />
        ))}
        <div className={styles.content}>
          <CutLetters className={styles.statusCode} text={String(statusCode)} />
          <PaperCard
            className={styles.messageCard}
            edge="quad-b"
            innerClassName={styles.messageCardInner}
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

  return (
    <Stack component={Section} sx={layoutSx}>
      <MouseAwareGlassContainer component={Typography} sx={statusCodeSx} variant="h1">
        {statusCode}
      </MouseAwareGlassContainer>
      <Typography sx={messageSx} variant="h5">
        {copy.classic}
      </Typography>
      <Link
        buttonProps={{
          color: 'secondary',
        }}
        href={homeRoute}
        isButton={true}
        sx={backLinkSx}
        title="Home"
      >
        Back home
      </Link>
    </Stack>
  );
}

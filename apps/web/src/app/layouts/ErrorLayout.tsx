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
import type { CutOutPlacement } from '../collage/cutOutPlacements';
import { PaperButton } from '../collage/PaperButton';
import { PaperCard } from '../collage/PaperCard';
import styles from './error.module.css';

type ErrorLayoutProps = {
  /**
   * The numeric code for the error's status
   */
  statusCode: number;
  /**
   * Visual surface for the error page
   */
  surface?: SiteSurface;
};

const ERROR_CUT_OUTS = [
  {
    color: 'viridian',
    id: 'error-monstera',
    rotationDeg: 22,
    shape: 'monstera',
    sizePx: 520,
    visibility: 'desktop',
    xPercent: 66,
    yPercent: -12,
    zIndex: 0,
  },
  {
    color: 'olive',
    id: 'error-fern',
    rotationDeg: -34,
    shape: 'fern',
    sizePx: 340,
    visibility: 'desktop',
    xPercent: -10,
    yPercent: 40,
    zIndex: 0,
  },
  {
    color: 'olive',
    id: 'error-seaweed',
    rotationDeg: -16,
    shape: 'seaweed2',
    sizePx: 240,
    visibility: 'desktop',
    xPercent: 56,
    yPercent: 64,
    zIndex: 1,
  },
  {
    color: 'star',
    id: 'error-star',
    rotationDeg: 10,
    shape: 'star5',
    sizePx: 46,
    visibility: 'desktop',
    xPercent: 36,
    yPercent: 6,
    zIndex: 3,
  },
] as const satisfies ReadonlyArray<CutOutPlacement>;

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

/**
 * Basic page layout for error pages. Max-width'd content, left aligned,
 * with a go home button at the bottom
 */
export function ErrorLayout({ statusCode, surface = 'classic' }: ErrorLayoutProps) {
  if (surface === 'collage') {
    const isNotFound = statusCode === 404;

    return (
      <section aria-label={String(statusCode)} className={styles.sheet}>
        <CutOutSymbols />
        {ERROR_CUT_OUTS.map((placement) => (
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
              {isNotFound ? 'Sorry, couldn‘t find that page.' : 'Something went wrong on my end.'}
            </Typography>
            <Typography>
              {isNotFound ? 'Email me if something is wrong.' : 'Email me if it keeps happening.'}
            </Typography>
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
        {statusCode === 404
          ? 'Sorry, couldn‘t find that page. Email me if something is wrong.'
          : 'Something went super wrong, sorry. Email me to let me know.'}
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

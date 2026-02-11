'use client';

import { homeRoute } from '@dg/shared-core/routes/app';
import { MouseAwareGlassContainer } from '@dg/ui/core/MouseAwareGlassContainer';
import { Section } from '@dg/ui/core/Section';
import { Link } from '@dg/ui/dependent/Link';
import type { SxObject } from '@dg/ui/theme';
import { Stack, Typography } from '@mui/material';

type ErrorLayoutProps = {
  /**
   * The numeric code for the error's status
   */
  statusCode: number;
};

const layoutSx: SxObject = {
  alignItems: 'center',
  gap: 3,
  marginTop: -8,
};

const statusCodeSx: SxObject = {
  filter: `drop-shadow(2px 2px 12px hsl(from var(--mui-palette-secondary-dark) h s calc(l * 0.2) / 0.4))`,
  flexShrink: 1,
  fontSize: { md: '280px', sm: '200px', xs: '140px' },
  fontStretch: 'extra-expanded',
  fontWeight: 900,
  textWrap: 'nowrap',
};

const messageSx: SxObject = {
  maxWidth: '26em',
  textWrap: 'balance',
};

const backLinkSx: SxObject = {
  marginTop: 3,
};

/**
 * Basic page layout for error pages. Max-width'd content, left aligned,
 * with a go home button at the bottom
 */
export function ErrorLayout({ statusCode }: ErrorLayoutProps) {
  return (
    <Stack component={Section} sx={layoutSx}>
      <MouseAwareGlassContainer component={Typography} sx={statusCodeSx} variant="h1">
        {statusCode}
      </MouseAwareGlassContainer>
      <Typography sx={messageSx} textAlign="center" variant="h5">
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

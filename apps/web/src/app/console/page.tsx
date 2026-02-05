import 'server-only';

import { Box, Divider, Stack, Typography } from '@mui/material';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { OauthCard, OauthCardSkeleton } from './OauthCard';
import { WebhookCard } from './WebhookCard';
import { WebhookCardSkeleton } from './WebhookCardSkeleton';

function PageHeader() {
  return (
    <>
      <Typography variant="h1">Console</Typography>
      <Typography color="text.secondary" variant="body1">
        This page is only available in development and test environments.
      </Typography>
    </>
  );
}

function OauthCardsLoading() {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { sm: 'repeat(auto-fit, minmax(280px, 1fr))', xs: '1fr' },
      }}
    >
      <OauthCardSkeleton />
      <OauthCardSkeleton />
    </Box>
  );
}

function OauthCards() {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { sm: 'repeat(auto-fit, minmax(280px, 1fr))', xs: '1fr' },
      }}
    >
      <Suspense fallback={<OauthCardSkeleton />}>
        <OauthCard provider="strava" />
      </Suspense>
      <Suspense fallback={<OauthCardSkeleton />}>
        <OauthCard provider="spotify" />
      </Suspense>
    </Box>
  );
}

function OauthSection() {
  return (
    <>
      <Typography variant="h2">OAuth connections</Typography>
      <Suspense fallback={<OauthCardsLoading />}>
        <OauthCards />
      </Suspense>
    </>
  );
}

function WebhookSection() {
  return (
    <>
      <Typography variant="h2">Webhook subscriptions</Typography>
      <Suspense fallback={<WebhookCardSkeleton />}>
        <WebhookCard />
      </Suspense>
    </>
  );
}

export default function ConsolePage() {
  const isAllowedEnv = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
  if (!isAllowedEnv) {
    notFound();
  }

  return (
    <main>
      <Stack spacing={3}>
        <PageHeader />
        <Divider />
        <OauthSection />
        <Divider />
        <WebhookSection />
      </Stack>
    </main>
  );
}

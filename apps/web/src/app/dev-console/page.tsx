import 'server-only';

import { Box, Divider, Stack, Typography } from '@mui/material';
import { OauthCard } from './oauth/OauthCard';
import { WebhookCard } from './webhooks/WebhookCard';

const oauthProviders = ['strava', 'spotify'] as const;

function PageHeader() {
  return (
    <>
      <Typography variant="h1">Dev console</Typography>
      <Typography color="text.secondary" variant="body1">
        This page is protected and intended for developer access.
      </Typography>
    </>
  );
}

function OauthSection() {
  return (
    <>
      <Typography variant="h2">OAuth connections</Typography>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { sm: 'repeat(auto-fit, minmax(280px, 1fr))', xs: '1fr' },
        }}
      >
        {oauthProviders.map((provider) => (
          <OauthCard key={provider} provider={provider} />
        ))}
      </Box>
    </>
  );
}

function WebhookSection() {
  return (
    <>
      <Typography variant="h2">Webhook subscriptions</Typography>
      <WebhookCard />
    </>
  );
}

export default function ConsolePage() {
  return (
    <main>
      <Stack gap={3}>
        <PageHeader />
        <Divider />
        <OauthSection />
        <Divider />
        <WebhookSection />
      </Stack>
    </main>
  );
}

import 'server-only';

import { Box, Divider, Stack, Typography } from '@mui/material';
import { OauthCard } from './oauth/OauthCard';
import { SpotifyImportCard } from './spotify/SpotifyImportCard';
import { WebhookCard } from './webhooks/WebhookCard';

const oauthProviders = ['strava', 'spotify'] as const;

function PageHeader() {
  return (
    <Stack gap={2}>
      <Typography variant="h1">Dev console</Typography>
      <Typography color="text.secondary" variant="body1">
        This page is protected and intended for developer access.
      </Typography>
      <Divider sx={{ marginBlockStart: 2 }} />
    </Stack>
  );
}

function CardSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Stack gap={3}>
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

export default function ConsolePage() {
  return (
    <main>
      <Stack gap={6}>
        <PageHeader />

        <CardSection title="OAuth connections">
          {oauthProviders.map((provider) => (
            <OauthCard key={provider} provider={provider} />
          ))}
        </CardSection>

        <CardSection title="Tools">
          <WebhookCard />
          <SpotifyImportCard />
        </CardSection>
      </Stack>
    </main>
  );
}

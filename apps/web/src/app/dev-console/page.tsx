import 'server-only';

import { Box, Divider, Stack, Typography } from '@mui/material';
import { OauthCard } from './oauth/OauthCard';
import { VercelSignInCard } from './vercel/VercelSignInCard';
import { WebhookCard } from './webhooks/WebhookCard';

const oauthProviders = ['strava', 'spotify'] as const;

function PageHeader() {
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

function CardSection({ title, children }: { title: string; children: React.ReactNode }) {
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
};

/**
 * Dev console shell. Keep this sync — await `searchParams` / cookies only inside
 * Suspense boundaries (see VercelSignInCard) so the route can prerender.
 */
export default function ConsolePage({ searchParams }: ConsolePageProps) {
  return (
    <main>
      <Stack
        sx={{
          gap: 6,
        }}
      >
        <PageHeader />

        <CardSection title="OAuth connections">
          {oauthProviders.map((provider) => (
            <OauthCard key={provider} provider={provider} />
          ))}
        </CardSection>

        <CardSection title="Flags identity">
          <VercelSignInCard searchParams={searchParams} />
        </CardSection>

        <CardSection title="Tools">
          <WebhookCard />
        </CardSection>
      </Stack>
    </main>
  );
}

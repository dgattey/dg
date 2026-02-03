import 'server-only';

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { getSpotifyOauthInitLink, getSpotifyOauthStatus } from '../../services/spotify';
import {
  getOauthTokenInitLink,
  getStravaOauthStatus,
  listWebhookSubscriptions,
} from '../../services/strava';
import { WebhookActions } from './WebhookActions';

type OauthStatus = {
  error: string | null;
  expiresAt: Date | null;
  isConnected: boolean;
};

type ResolvedLinks = {
  error: string | null;
  forceHref: string | null;
  reuseHref: string | null;
};

function resolveLinks(createLink: (options: { forceDialog: boolean }) => string): ResolvedLinks {
  try {
    return {
      error: null,
      forceHref: createLink({ forceDialog: true }),
      reuseHref: createLink({ forceDialog: false }),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { error: message, forceHref: null, reuseHref: null };
  }
}

function StatusChip({ isConnected }: { isConnected: boolean }) {
  return (
    <Chip
      color={isConnected ? 'success' : 'default'}
      label={isConnected ? 'Connected' : 'Not connected'}
    />
  );
}

function TokenExpiry({ expiresAt }: { expiresAt: Date | null }) {
  if (!expiresAt) {
    return null;
  }
  return (
    <Typography color="text.secondary" variant="body2">
      Access token expires at {expiresAt.toLocaleString()}
    </Typography>
  );
}

function ErrorMessage({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }
  return (
    <Typography color="error" variant="body2">
      {message}
    </Typography>
  );
}

type ProviderCardProps = {
  links: ResolvedLinks;
  name: string;
  status: OauthStatus;
};

function OauthProviderCard({ links, name, status }: ProviderCardProps) {
  const errorMessage = status.error ?? links.error;

  return (
    <Card>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack alignItems="center" direction="row" spacing={1}>
            <Typography variant="h6">{name}</Typography>
            <StatusChip isConnected={status.isConnected} />
          </Stack>
          <ErrorMessage message={errorMessage} />
          <Stack direction="row" flexWrap="wrap" spacing={1}>
            <Button
              disabled={!links.reuseHref}
              href={links.reuseHref ?? undefined}
              size="small"
              variant="outlined"
            >
              Reuse Session
            </Button>
            <Button
              disabled={!links.forceHref}
              href={links.forceHref ?? undefined}
              size="small"
              variant="contained"
            >
              New Session
            </Button>
          </Stack>
          <TokenExpiry expiresAt={status.expiresAt} />
        </Stack>
      </CardContent>
    </Card>
  );
}

type WebhookSubscription = {
  id: number;
  callback_url: string;
  created_at: string;
};

type WebhookCardProps = {
  error: string | null;
  name: string;
  subscription: WebhookSubscription | null;
};

function WebhookCard({ error, name, subscription }: WebhookCardProps) {
  const hasSubscription = subscription !== null;

  return (
    <Card>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack alignItems="center" direction="row" spacing={1}>
            <Typography variant="h6">{name}</Typography>
            <StatusChip isConnected={hasSubscription} />
          </Stack>
          <ErrorMessage message={error} />
          {hasSubscription && (
            <Stack spacing={0.5}>
              <Typography color="text.secondary" variant="body2">
                Subscription ID: {subscription.id}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Callback URL: {subscription.callback_url}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Created: {new Date(subscription.created_at).toLocaleString()}
              </Typography>
            </Stack>
          )}
          <WebhookActions hasSubscription={hasSubscription} subscriptionId={subscription?.id} />
        </Stack>
      </CardContent>
    </Card>
  );
}

async function getStravaWebhookStatus(): Promise<{
  error: string | null;
  subscription: WebhookSubscription | null;
}> {
  try {
    const subscriptions = await listWebhookSubscriptions('strava');
    // Strava only allows one subscription per app
    const subscription = subscriptions[0] ?? null;
    return { error: null, subscription };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch subscriptions';
    return { error: message, subscription: null };
  }
}

// Skeleton fallbacks for loading states
function OauthCardSkeleton() {
  return (
    <Card>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack alignItems="center" direction="row" spacing={1}>
            <Skeleton height={28} variant="text" width={80} />
            <Skeleton height={24} variant="rounded" width={100} />
          </Stack>
          <Stack direction="row" spacing={1}>
            <Skeleton height={30} variant="rounded" width={110} />
            <Skeleton height={30} variant="rounded" width={100} />
          </Stack>
          <Skeleton height={20} variant="text" width="60%" />
        </Stack>
      </CardContent>
    </Card>
  );
}

function WebhookCardSkeleton() {
  return (
    <Card>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack alignItems="center" direction="row" spacing={1}>
            <Skeleton height={28} variant="text" width={120} />
            <Skeleton height={24} variant="rounded" width={100} />
          </Stack>
          <Skeleton height={20} variant="text" width="80%" />
          <Skeleton height={20} variant="text" width="70%" />
          <Skeleton height={36} variant="rounded" width={150} />
        </Stack>
      </CardContent>
    </Card>
  );
}

// Async components that fetch their own data
// Each calls connection() first to signal dynamic rendering before accessing the database
async function StravaOauthCard() {
  await connection();
  const status = await getStravaOauthStatus();
  const links = resolveLinks(getOauthTokenInitLink);

  return <OauthProviderCard links={links} name="Strava" status={status} />;
}

async function SpotifyOauthCard() {
  await connection();
  const status = await getSpotifyOauthStatus();
  const links = resolveLinks(getSpotifyOauthInitLink);

  return <OauthProviderCard links={links} name="Spotify" status={status} />;
}

async function StravaWebhookCardContent() {
  await connection();
  const { error, subscription } = await getStravaWebhookStatus();

  return <WebhookCard error={error} name="Strava Webhooks" subscription={subscription} />;
}

export default function DevPage() {
  const isAllowedEnv = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
  if (!isAllowedEnv) {
    notFound();
  }

  return (
    <main>
      <Stack spacing={3}>
        <Typography variant="h1">Developer Tools</Typography>
        <Typography color="text.secondary" variant="body1">
          This page is only available in development and test environments.
        </Typography>

        <Divider />

        <Typography variant="h2">OAuth Connections</Typography>
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { sm: 'repeat(auto-fit, minmax(280px, 1fr))', xs: '1fr' },
          }}
        >
          <Suspense fallback={<OauthCardSkeleton />}>
            <StravaOauthCard />
          </Suspense>
          <Suspense fallback={<OauthCardSkeleton />}>
            <SpotifyOauthCard />
          </Suspense>
        </Box>

        <Divider />

        <Typography variant="h2">Webhook Subscriptions</Typography>
        <Suspense fallback={<WebhookCardSkeleton />}>
          <StravaWebhookCardContent />
        </Suspense>
      </Stack>
    </main>
  );
}

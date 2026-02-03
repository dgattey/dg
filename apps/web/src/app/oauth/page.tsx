import 'server-only';

import { Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { notFound } from 'next/navigation';
import { getSpotifyOauthInitLink, getSpotifyOauthStatus } from '../../services/spotify';
import { getOauthTokenInitLink, getStravaOauthStatus } from '../../services/strava';

type OauthStatus = {
  error: string | null;
  expiresAt: Date | null;
  isConnected: boolean;
};

type ResolvedLink = {
  error: string | null;
  href: string | null;
};

function resolveLink(createLink: () => string): ResolvedLink {
  try {
    return { error: null, href: createLink() };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { error: message, href: null };
  }
}

function StatusChip({ isConnected }: { isConnected: boolean }) {
  return (
    <Chip
      color={isConnected ? 'success' : 'default'}
      label={isConnected ? 'Connected' : 'Not connected'}
      size="small"
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
  buttonLabel: string;
  link: ResolvedLink;
  name: string;
  status: OauthStatus;
};

function ProviderCard({ buttonLabel, link, name, status }: ProviderCardProps) {
  const errorMessage = status.error ?? link.error;

  return (
    <Card>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack alignItems="center" direction="row" spacing={1}>
            <Typography variant="h6">{name}</Typography>
            <StatusChip isConnected={status.isConnected} />
          </Stack>
          <ErrorMessage message={errorMessage} />
          <Button disabled={!link.href} href={link.href ?? undefined} variant="contained">
            {buttonLabel}
          </Button>
          <TokenExpiry expiresAt={status.expiresAt} />
        </Stack>
      </CardContent>
    </Card>
  );
}

export default async function OauthPage() {
  const isAllowedEnv = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
  if (!isAllowedEnv) {
    notFound();
  }

  const [stravaStatus, spotifyStatus] = await Promise.all([
    getStravaOauthStatus(),
    getSpotifyOauthStatus(),
  ]);

  const stravaLink = resolveLink(getOauthTokenInitLink);
  const spotifyLink = resolveLink(getSpotifyOauthInitLink);

  return (
    <main>
      <Stack spacing={3}>
        <Typography variant="h1">OAuth Connections</Typography>
        <Typography color="text.secondary" variant="body1">
          This page is only available in development and test environments.
        </Typography>

        <ProviderCard
          buttonLabel="Start Strava OAuth"
          link={stravaLink}
          name="Strava"
          status={stravaStatus}
        />

        <ProviderCard
          buttonLabel="Start Spotify OAuth"
          link={spotifyLink}
          name="Spotify"
          status={spotifyStatus}
        />
      </Stack>
    </main>
  );
}

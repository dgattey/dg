import 'server-only';

import { vercelAuthLogoutRoute, vercelAuthRoute } from '@dg/shared-core/routes/api';
import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { Button, Stack, Typography } from '@mui/material';
import { Suspense } from 'react';
import { getVercelSession } from '../../../../auth/vercel/getVercelSession';
import { PaperButton } from '../../../collage/PaperButton';
import { DevConsoleCardShell } from '../DevConsoleCardShell';
import { ErrorMessage, StatusChip } from '../StatusIndicators';

type SearchParams = Promise<Record<string, string | Array<string> | undefined>>;

type VercelSignInCardProps = {
  searchParams?: SearchParams;
  surface?: SiteSurface;
};

async function resolveAuthErrorReason(searchParams?: SearchParams): Promise<string | null> {
  const params = (await searchParams) ?? {};
  if (params.vercel_auth !== 'error') {
    return null;
  }
  const reasonValue = params.reason;
  return typeof reasonValue === 'string' ? reasonValue : 'unknown';
}

export async function VercelSignInCardContent({
  searchParams,
  surface = 'classic',
}: VercelSignInCardProps) {
  const [session, authErrorReason] = await Promise.all([
    getVercelSession(),
    resolveAuthErrorReason(searchParams),
  ]);
  const isSignedIn = Boolean(session);

  return (
    <>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Typography variant="h3">Vercel identity</Typography>
        <StatusChip isConnected={isSignedIn} surface={surface} />
      </Stack>

      <Typography color="text.secondary" variant="body2">
        Optional Sign in with Vercel for Flags user targeting. Any Vercel account can complete
        OAuth; segment rules decide whether you match.
      </Typography>

      <ErrorMessage
        message={authErrorReason ? `Sign-in failed (${authErrorReason}). Try again.` : null}
        surface={surface}
      />

      {session ? (
        <Stack sx={{ gap: 0.5 }}>
          <Typography variant="body2">Email: {session.email}</Typography>
          <Typography color="text.secondary" variant="caption">
            id: {session.id}
          </Typography>
          {session.name ? (
            <Typography color="text.secondary" variant="caption">
              name: {session.name}
            </Typography>
          ) : null}
        </Stack>
      ) : null}

      {surface === 'collage' ? (
        <PaperButton
          href={session ? vercelAuthLogoutRoute : vercelAuthRoute}
          tiltDeg={session ? 2 : -2}
          title={session ? 'Sign out' : 'Sign in with Vercel'}
          tone={session ? 'cream' : 'ochre'}
        >
          {session ? 'Sign out' : 'Sign in with Vercel'}
        </PaperButton>
      ) : session ? (
        <Button href={vercelAuthLogoutRoute} size="small" variant="outlined">
          Sign out
        </Button>
      ) : (
        <Button href={vercelAuthRoute} size="small" variant="contained">
          Sign in with Vercel
        </Button>
      )}
    </>
  );
}

/**
 * Dev-console card for optional Sign in with Vercel (Flags identify only).
 * Session + searchParams are read inside Suspense so /dev-console can prerender.
 */
export function VercelSignInCard({ searchParams, surface = 'classic' }: VercelSignInCardProps) {
  return (
    <DevConsoleCardShell surface={surface}>
      <Suspense fallback={<Typography variant="body2">Loading identity…</Typography>}>
        <VercelSignInCardContent searchParams={searchParams} surface={surface} />
      </Suspense>
    </DevConsoleCardShell>
  );
}

import 'server-only';

import { vercelAuthLogoutRoute, vercelAuthRoute } from '@dg/shared-core/routes/api';
import { Button, Stack, Typography } from '@mui/material';
import { Suspense } from 'react';
import { getVercelSession } from '../../../auth/vercel/getVercelSession';
import { DevConsoleCardShell } from '../DevConsoleCardShell';
import { StatusChip } from '../StatusIndicators';

type VercelSignInCardProps = {
  authErrorReason?: string | null;
};

async function VercelSignInCardContent({ authErrorReason }: VercelSignInCardProps) {
  const session = await getVercelSession();
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
        <StatusChip isConnected={isSignedIn} />
      </Stack>

      <Typography color="text.secondary" variant="body2">
        Optional Sign in with Vercel for Flags user targeting. Any Vercel account can complete
        OAuth; segment rules decide whether you match.
      </Typography>

      {authErrorReason ? (
        <Typography color="error" variant="body2">
          Sign-in failed ({authErrorReason}). Try again.
        </Typography>
      ) : null}

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

      {session ? (
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
 */
export function VercelSignInCard({ authErrorReason }: VercelSignInCardProps) {
  return (
    <DevConsoleCardShell>
      <Suspense fallback={<Typography variant="body2">Loading identity…</Typography>}>
        <VercelSignInCardContent authErrorReason={authErrorReason} />
      </Suspense>
    </DevConsoleCardShell>
  );
}

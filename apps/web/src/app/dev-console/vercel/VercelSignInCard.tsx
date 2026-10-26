import 'server-only';

import { vercelAuthRoute } from '@dg/shared-core/routes/api';
import { Typography } from '@dg/ui/core/Typography';
import { Suspense } from 'react';
import { getVercelSession } from '../../../auth/vercel/getVercelSession';
import { signOutOfVercel } from '../../../auth/vercel/session.actions';
import { PaperButton } from '../../collage/PaperButton';
import { DevConsoleCardShell } from '../DevConsoleCardShell';
import { ErrorMessage, StatusChip } from '../StatusIndicators';

type SearchParams = Promise<Record<string, string | Array<string> | undefined>>;

type VercelSignInCardProps = {
  searchParams?: SearchParams;
};

async function resolveAuthErrorReason(searchParams?: SearchParams): Promise<string | null> {
  const params = (await searchParams) ?? {};
  if (params.vercel_auth !== 'error') {
    return null;
  }
  const reasonValue = params.reason;
  return typeof reasonValue === 'string' ? reasonValue : 'unknown';
}

function formatAuthError(reason: string | null): string | null {
  if (!reason) {
    return null;
  }
  if (reason === 'unauthorized_user') {
    return 'This Vercel account is not authorized to access the dev console.';
  }
  return `Sign-in failed (${reason}). Try again.`;
}

export async function VercelSignInCardContent({ searchParams }: VercelSignInCardProps = {}) {
  const [session, authErrorReason] = await Promise.all([
    getVercelSession(),
    resolveAuthErrorReason(searchParams),
  ]);
  const isSignedIn = Boolean(session);

  return (
    <>
      <div className="devConsole__row devConsole__row--wide">
        <Typography as="h3" variant="title-md">
          Vercel identity
        </Typography>
        <StatusChip isConnected={isSignedIn} />
      </div>

      <Typography color="var(--dg-palette-text-secondary)" variant="meta">
        {isSignedIn
          ? 'Signed in as the site owner to manage OAuth connections and webhooks.'
          : 'Sign in with your owner Vercel account to unlock OAuth connections and webhook tools.'}
      </Typography>

      <ErrorMessage message={formatAuthError(authErrorReason)} />

      {session ? (
        <div className="devConsole__stack devConsole__stack--tight">
          <Typography variant="meta">Email: {session.email}</Typography>
          <Typography color="var(--dg-palette-text-secondary)" variant="caption">
            id: {session.id}
          </Typography>
          {session.name ? (
            <Typography color="var(--dg-palette-text-secondary)" variant="caption">
              name: {session.name}
            </Typography>
          ) : null}
        </div>
      ) : null}

      {session ? (
        <form action={signOutOfVercel}>
          <PaperButton tiltDeg={2} tone="cream" type="submit">
            Sign out
          </PaperButton>
        </form>
      ) : (
        <PaperButton href={vercelAuthRoute} tiltDeg={-2} title="Sign in with Vercel" tone="ochre">
          Sign in with Vercel
        </PaperButton>
      )}
    </>
  );
}

/**
 * Dev-console card for Sign in with Vercel authentication.
 * Session + searchParams are read inside Suspense so /dev-console can prerender.
 */
export function VercelSignInCard({ searchParams }: VercelSignInCardProps) {
  return (
    <DevConsoleCardShell>
      <Suspense fallback={<Typography variant="meta">Loading identity…</Typography>}>
        <VercelSignInCardContent searchParams={searchParams} />
      </Suspense>
    </DevConsoleCardShell>
  );
}

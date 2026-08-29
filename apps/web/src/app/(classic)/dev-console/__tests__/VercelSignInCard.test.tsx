import { vercelAuthRoute } from '@dg/shared-core/routes/api';
import { render, screen } from '@testing-library/react';

jest.mock('../../../../auth/vercel/getVercelSession', () => ({
  getVercelSession: jest.fn().mockResolvedValue(null),
}));

import { VercelSignInCardContent } from '../vercel/VercelSignInCard';

describe('VercelSignInCard', () => {
  it('keeps the Vercel OAuth destination on the collage surface', async () => {
    render(await VercelSignInCardContent({ surface: 'collage' }));

    expect(screen.getByText('Not connected')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in with Vercel' })).toHaveAttribute(
      'href',
      vercelAuthRoute,
    );
  });

  it('shows OAuth errors without changing the sign-in destination', async () => {
    render(
      await VercelSignInCardContent({
        searchParams: Promise.resolve({ reason: 'denied', vercel_auth: 'error' }),
        surface: 'collage',
      }),
    );

    expect(screen.getByText('Sign-in failed (denied). Try again.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in with Vercel' })).toHaveAttribute(
      'href',
      vercelAuthRoute,
    );
  });
});

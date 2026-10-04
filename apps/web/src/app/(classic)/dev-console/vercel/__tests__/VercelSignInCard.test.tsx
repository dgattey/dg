/**
 * Next prefetches every in-viewport Link in production. When Sign out was a
 * link to a GET route, that prefetch ran the sign-out as soon as the signed-in
 * card rendered, so Sign out has to be a form submit nothing can prefetch.
 */
import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { render, screen } from '@testing-library/react';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  usePathname: () => '/dev-console',
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('../../../../../auth/vercel/getVercelSession', () => ({
  getVercelSession: jest.fn().mockResolvedValue({ email: 'dylan@example.com', id: 'user_123' }),
}));

import { VercelSignInCardContent } from '../VercelSignInCard';

describe('VercelSignInCard', () => {
  it.each<SiteSurface>(['classic', 'collage'])(
    'signs out through a form submit on the %s surface',
    async (surface) => {
      render(await VercelSignInCardContent({ surface }));

      const signOut = screen.getByRole('button', { name: 'Sign out' });
      expect(signOut).toHaveAttribute('type', 'submit');
      expect(signOut.closest('form')).not.toBeNull();
      expect(screen.queryByRole('link', { name: 'Sign out' })).toBeNull();
    },
  );
});

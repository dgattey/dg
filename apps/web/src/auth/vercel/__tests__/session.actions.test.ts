import { devConsoleRoute } from '@dg/shared-core/routes/app';
import { redirect } from 'next/navigation';
import { VERCEL_SESSION_COOKIE } from '../session';
import { signOutOfVercel } from '../session.actions';

const mockSet = jest.fn();

jest.mock('next/headers', () => ({
  cookies: async () => ({ set: mockSet }),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('signOutOfVercel', () => {
  it('expires the session cookie and reloads the dev console', async () => {
    await signOutOfVercel();

    expect(mockSet).toHaveBeenCalledWith(
      VERCEL_SESSION_COOKIE,
      '',
      expect.objectContaining({ httpOnly: true, maxAge: 0, path: '/' }),
    );
    expect(redirect).toHaveBeenCalledWith(devConsoleRoute);
  });
});

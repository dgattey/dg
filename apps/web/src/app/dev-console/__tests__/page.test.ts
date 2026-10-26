import { isDevConsoleAuthenticated } from '../../../auth/vercel/getVercelSession';
import ConsolePage, { DevConsoleBody } from '../page';

jest.mock('../../../auth/vercel/getVercelSession', () => ({
  getVercelSession: jest.fn(),
  isDevConsoleAuthenticated: jest.fn(),
}));

describe('Dev console page', () => {
  describe('rendering', () => {
    it('returns a valid React element', () => {
      const result = ConsolePage({});

      expect(result).toBeDefined();
      expect(result.type).toBe('section');
    });

    it('renders only the Access sign-in gate when unauthenticated', async () => {
      jest.mocked(isDevConsoleAuthenticated).mockResolvedValueOnce(false);

      const body = await DevConsoleBody({});
      expect(body.props.sectionId).toBe('Access');
      expect(body.props.title).toBe('Access');
    });

    it('renders OAuth connections, Access, and Tools sections when authenticated', async () => {
      jest.mocked(isDevConsoleAuthenticated).mockResolvedValueOnce(true);

      const body = await DevConsoleBody({});
      const sectionIds = body.props.children.map(
        (child: { props: { sectionId: string } }) => child.props.sectionId,
      );
      expect(sectionIds).toEqual(['OAuth-connections', 'Access', 'Tools']);
    });
  });
});

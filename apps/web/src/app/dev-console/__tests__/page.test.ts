import ConsolePage from '../page';

describe('Dev console page', () => {
  describe('rendering', () => {
    it('returns a valid React element', async () => {
      const result = await ConsolePage({});

      expect(result).toBeDefined();
      expect(result.type).toBe('main');
    });
  });
});

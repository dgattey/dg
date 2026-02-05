/**
 * @jest-environment node
 */
import ConsolePage from '../page';

describe('Dev console page', () => {
  describe('rendering', () => {
    it('returns a valid React element', () => {
      const result = ConsolePage();

      expect(result).toBeDefined();
      expect(result.type).toBe('main');
    });
  });
});

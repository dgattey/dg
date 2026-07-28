/**
 * @jest-environment node
 */

import { markdownPagePaths } from '@dg/shared-core/routes/app';
import { pageMarkdownGenerators } from '../pageMarkdown';

describe('pageMarkdownGenerators', () => {
  it('covers every registered markdown page path', () => {
    expect(Object.keys(pageMarkdownGenerators).sort()).toEqual([...markdownPagePaths].sort());
  });
});

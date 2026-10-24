/**
 * @jest-environment node
 */

import { homeRoute, markdownPagePaths } from '@dg/shared-core/routes/app';
import { generateStaticParams } from '../[[...slug]]/route';
import { pageMarkdownGenerators } from '../pageMarkdown';

describe('pageMarkdownGenerators', () => {
  it('covers every registered markdown page path', () => {
    expect(Object.keys(pageMarkdownGenerators).sort()).toEqual([...markdownPagePaths].sort());
  });

  it('prerenders every registered markdown page path in /llm-markdown/[[...slug]]', () => {
    const prerenderedPaths = generateStaticParams().map(({ slug }) =>
      slug.length === 0 ? homeRoute : `/${slug.join('/')}`,
    );
    expect(prerenderedPaths).toEqual(markdownPagePaths);
  });
});

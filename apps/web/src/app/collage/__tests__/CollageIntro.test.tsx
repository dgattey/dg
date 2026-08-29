/**
 * @jest-environment jsdom
 */

import type { IntroContent } from '@dg/content-models/contentful/renderables/intro';
import type { RenderableLink } from '@dg/content-models/contentful/renderables/links';
import { render, screen } from '@testing-library/react';
import { IntroCard } from '../../home/IntroCard';

const linkedInLink: RenderableLink = {
  title: 'LinkedIn',
  url: 'https://www.linkedin.com/in/dgattey',
};

const introBlock: IntroContent = {
  image: {
    height: 693,
    title: 'Portrait of Dylan',
    url: 'https://example.com/portrait.webp',
    width: 520,
  },
  textBlock: {
    content: {
      json: {
        content: [
          {
            content: [
              {
                data: {},
                marks: [],
                nodeType: 'text',
                value: 'Hey friends!',
              },
            ],
            data: {},
            nodeType: 'heading-1',
          },
          {
            content: [
              {
                data: {},
                marks: [],
                nodeType: 'text',
                value: 'A real introduction',
              },
            ],
            data: {},
            nodeType: 'heading-2',
          },
          {
            content: [
              {
                data: {},
                marks: [],
                nodeType: 'text',
                value: 'This keeps ',
              },
              {
                data: {},
                marks: [{ type: 'bold' }],
                nodeType: 'text',
                value: 'important',
              },
              {
                data: {},
                marks: [],
                nodeType: 'text',
                value: ' text and its ',
              },
              {
                content: [
                  {
                    data: {},
                    marks: [],
                    nodeType: 'text',
                    value: 'source link',
                  },
                ],
                data: { uri: 'https://example.com/source' },
                nodeType: 'hyperlink',
              },
              {
                data: {},
                marks: [],
                nodeType: 'text',
                value: '.',
              },
            ],
            data: {},
            nodeType: 'paragraph',
          },
          {
            content: [],
            data: { target: { sys: { id: 'portfolio-entry' } } },
            nodeType: 'embedded-entry-inline',
          },
          {
            content: [],
            data: { target: { sys: { id: 'diagram-asset' } } },
            nodeType: 'embedded-asset-block',
          },
        ],
        data: {},
        nodeType: 'document',
      },
      links: {
        assets: {
          block: [
            {
              height: 400,
              sys: { id: 'diagram-asset' },
              title: 'Embedded diagram',
              url: 'https://example.com/diagram.webp',
              width: 600,
            },
          ],
        },
        entries: {
          block: [],
          inline: [
            {
              sys: { id: 'portfolio-entry' },
              title: 'Portfolio',
              url: 'https://example.com/portfolio',
            },
          ],
        },
      },
    },
  },
};

describe('CollageIntro', () => {
  it('moves only the plain headline and preserves rich-text semantics, assets, and links', () => {
    render(<IntroCard introBlock={introBlock} linkedInLink={linkedInLink} surface="collage" />);

    const headline = screen.getByRole('heading', { level: 1, name: 'Hey friends!' });
    expect(headline).toHaveTextContent('Hey friends!');
    expect(
      screen.getByRole('heading', { level: 2, name: 'A real introduction' }),
    ).toBeInTheDocument();
    expect(screen.getByText('important').tagName).toBe('B');
    expect(screen.getByRole('link', { name: 'source link' })).toHaveAttribute(
      'href',
      'https://example.com/source',
    );
    expect(screen.getByRole('link', { name: 'Portfolio' })).toHaveAttribute(
      'href',
      'https://example.com/portfolio',
    );
    expect(screen.getByRole('img', { name: 'Embedded diagram' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Portrait of Dylan' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About on LinkedIn' })).toHaveAttribute(
      'href',
      linkedInLink.url,
    );
  });
});

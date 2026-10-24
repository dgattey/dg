import type { IntroContent } from '@dg/content-models/contentful/renderables/intro';
import { render, screen } from '@testing-library/react';
import { IntroCard } from '../IntroCard';

const introBlock: IntroContent = {
  image: {
    height: 660,
    title: 'Intro image',
    url: 'https://example.com/intro.webp',
    width: 660,
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
                value: 'About me',
              },
            ],
            data: {},
            nodeType: 'paragraph',
          },
        ],
        data: {},
        nodeType: 'document',
      },
      links: {
        assets: {
          block: [],
        },
        entries: {
          block: [],
          inline: [],
        },
      },
    },
  },
};

describe('Homepage basics', () => {
  it('renders the about text', () => {
    render(<IntroCard introBlock={introBlock} linkedInLink={null} />);

    expect(screen.getByText('About me')).toBeInTheDocument();
  });
});

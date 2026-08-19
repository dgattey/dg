import { render, screen } from '@testing-library/react';
import { IntroCard } from '../IntroCard';

const introBlock = {
  image: {
    height: 660,
    title: 'Intro image',
    url: '/.greenhouse-local/portrait.webp',
    width: 660,
  },
  textBlock: {
    content: {
      json: {
        content: [
          {
            content: [{ data: {}, marks: [], nodeType: 'text', value: 'Dylan Gattey' }],
            data: {},
            nodeType: 'heading-1',
          },
          {
            content: [
              { data: {}, marks: [], nodeType: 'text', value: 'Engineer. Problem solver.' },
            ],
            data: {},
            nodeType: 'paragraph',
          },
        ],
        data: {},
        nodeType: 'document',
      },
      links: { assets: { block: [] }, entries: { block: [], inline: [] } },
    },
  },
};

describe('IntroCard', () => {
  it('keeps the split image and text cards by default', () => {
    render(<IntroCard introBlock={introBlock} linkedInLink={null} />);
    expect(screen.getByText('Dylan Gattey')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Intro image' })).toBeInTheDocument();
  });

  it('composes name, portrait, and socials in one card', () => {
    render(
      <IntroCard
        introBlock={introBlock}
        linkedInLink={null}
        socialLinks={[
          { icon: 'github', title: 'GitHub', url: 'https://github.com/dgattey' },
          { icon: 'linkedin', title: 'LinkedIn', url: 'https://linkedin.com/in/dgattey' },
        ]}
        variant="composed"
      />,
    );

    expect(screen.getByText('Dylan Gattey')).toBeInTheDocument();
    expect(screen.getByText('Engineer. Problem solver.')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Intro image' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toBeInTheDocument();
    expect(screen.queryByText('About')).not.toBeInTheDocument();
  });
});

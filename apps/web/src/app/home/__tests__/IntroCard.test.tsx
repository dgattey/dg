import { readFileSync } from 'node:fs';
import { join } from 'node:path';
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
          {
            content: [
              {
                data: {},
                marks: [],
                nodeType: 'text',
                value: 'Away from the digital, I bake bread & explore the world through cycling.',
              },
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
    expect(
      screen.getByText('Away from the digital, I bake bread & explore the world through cycling.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Intro image' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toBeInTheDocument();
    expect(screen.queryByText('About')).not.toBeInTheDocument();
  });

  it('links the composed portrait to LinkedIn with an About overlay', () => {
    render(
      <IntroCard
        introBlock={introBlock}
        linkedInLink={{
          icon: 'linkedin',
          title: 'LinkedIn',
          url: 'https://linkedin.com/in/dgattey',
        }}
        socialLinks={[{ icon: 'github', title: 'GitHub', url: 'https://github.com/dgattey' }]}
        variant="composed"
      />,
    );

    const about = screen.getByRole('link', { name: 'About' });
    expect(about).toHaveAttribute('href', 'https://linkedin.com/in/dgattey');
    expect(about).toHaveAttribute('target', '_blank');
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(document.querySelector('[data-role="intro-about-overlay"]')).toBeTruthy();
  });

  it('does not force a two-word heading measure onto the bio column', () => {
    const source = readFileSync(join(__dirname, '../IntroCard.tsx'), 'utf8');
    expect(source).not.toContain('6.8ch');
    expect(source).toContain("maxWidth: '40ch'");
    expect(source).toContain("sm: '40%'");
    expect(source).toContain("sm: 'right'");
  });
});

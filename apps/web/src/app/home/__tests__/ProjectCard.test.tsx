import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import { ProjectCard } from '../ProjectCard';

const project = {
  description: {
    json: {
      content: [
        {
          content: [
            {
              data: {},
              marks: [],
              nodeType: 'text',
              value: 'A quieter way to keep a long-running project honest.',
            },
          ],
          data: {},
          nodeType: 'paragraph',
        },
      ],
      data: {},
      nodeType: 'document',
    },
  },
  link: { icon: null, title: 'Flowstate', url: 'https://example.com/flowstate' },
  thumbnail: { height: 200, url: 'https://example.com/flowstate.png', width: 200 },
  title: 'Flowstate',
  type: ['TypeScript', 'React'],
};

describe('ProjectCard', () => {
  it('keeps the media overlay treatment by default', () => {
    render(<ProjectCard {...project} />);
    expect(screen.getByText('Flowstate')).toBeInTheDocument();
    expect(screen.queryByText('Featured project')).not.toBeInTheDocument();
  });

  it('shows tags and a view project CTA in the featured treatment', () => {
    render(<ProjectCard {...project} variant="featured" />);
    expect(screen.getByText('Featured project')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('View project →')).toBeInTheDocument();
    expect(
      screen.getByText('A quieter way to keep a long-running project honest.'),
    ).toBeInTheDocument();
  });

  it('keeps the featured title as one heading and a single CTA link', () => {
    render(<ProjectCard {...project} variant="featured" />);
    expect(screen.getByRole('heading', { name: 'Flowstate' })).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it('sizes leftover tiles to their copy and keeps the title in one word', () => {
    const { container } = render(<ProjectCard {...project} eyebrow="Project" variant="tile" />);
    const title = screen.getByRole('heading', { name: 'Flowstate' });
    expect(title).toHaveClass('MuiTypography-h4');
    expect(title).toHaveStyle({ overflowWrap: 'normal' });
    expect(container.querySelector('[data-bento="project"]')).toBeTruthy();
    expect(container.querySelector('[data-project-mark]')).toBeTruthy();
    expect(
      screen.getByText('A quieter way to keep a long-running project honest.'),
    ).toBeInTheDocument();
    const source = readFileSync(join(__dirname, '../ProjectCard.tsx'), 'utf8');
    expect(source).toContain("'@container (max-width: 575px)'");
    expect(source).toContain("overflowWrap: 'normal'");
    expect(source).toContain("objectFit: 'contain'");
  });

  it('keeps every tag as a chip that cannot shrink off its pill', () => {
    render(<ProjectCard {...project} variant="featured" />);
    const typescript = screen.getByText('TypeScript');
    const react = screen.getByText('React');
    expect(typescript).toHaveClass('MuiChip-label');
    expect(react).toHaveClass('MuiChip-label');
    expect(typescript.closest('.MuiChip-root')).toBeTruthy();
    expect(react.closest('.MuiChip-root')).toBeTruthy();
    const source = readFileSync(join(__dirname, '../ProjectCard.tsx'), 'utf8');
    expect(source).toContain('flexShrink: 0');
  });
});

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

  it('fills the card top with the thumbnail and keeps copy on the type scale', () => {
    const { container } = render(<ProjectCard {...project} eyebrow="Project" variant="tile" />);
    const title = screen.getByRole('heading', { name: 'Flowstate' });
    expect(title).toHaveClass('MuiTypography-h3');
    expect(title.tagName).toBe('H3');
    expect(screen.getByRole('img', { name: 'Flowstate' })).toBeInTheDocument();
    expect(container.querySelector('[data-bento="project"]')).toBeTruthy();
    expect(container.querySelector('[data-project-media]')).toBeTruthy();
    expect(container.querySelector('[data-project-mark]')).toBeNull();
    expect(screen.getByText('View project →')).toHaveClass('MuiTypography-body2');
    expect(screen.getByText('Project')).toHaveClass('MuiTypography-overline');
    const source = readFileSync(join(__dirname, '../ProjectCard.tsx'), 'utf8');
    expect(source).toContain('getConcentricBorderRadius');
    expect(source).toContain("objectFit: 'cover'");
    expect(source).toContain('data-project-media');
  });

  it('keeps the mark only when the thumbnail url is empty', () => {
    const { container } = render(
      <ProjectCard
        {...project}
        thumbnail={{ height: 0, url: '', width: 0 }}
        variant="featured"
      />,
    );
    expect(container.querySelector('[data-project-mark]')).toBeTruthy();
    expect(container.querySelector('[data-project-media]')).toBeNull();
    expect(screen.queryByRole('img', { name: 'Flowstate' })).not.toBeInTheDocument();
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
    expect(source).toContain("typography: 'caption'");
  });
});

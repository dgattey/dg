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
  });

  it('keeps the featured title as one heading and a single CTA link', () => {
    render(<ProjectCard {...project} variant="featured" />);
    expect(screen.getByRole('heading', { name: 'Flowstate' })).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });
});

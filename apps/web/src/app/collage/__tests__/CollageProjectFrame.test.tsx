/**
 * @jest-environment jsdom
 */

import type { RenderableProject } from '@dg/content-models/contentful/renderables/projects';
import { render, screen } from '@testing-library/react';
import { CollageProjectFrame } from '../CollageProjectFrame';
import type { ProjectFrameStyle } from '../workSheetFrames';

jest.mock('../PaperCard', () => ({
  PaperCard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('../PaperTag', () => ({
  PaperTag: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="tag">{children}</span>
  ),
}));

jest.mock('../Print', () => ({
  Print: ({ alt, treatment }: { alt: string; treatment?: string }) => (
    <span aria-label={alt} data-treatment={treatment} role="img" />
  ),
}));

const style: ProjectFrameStyle = {
  edge: 'quad-a',
  printTone: 'var(--ink-on-cream)',
  tagClassName: 'tagTopLeft',
  tagTiltDeg: -3,
  tagTone: 'ochre',
  tiltDeg: -0.8,
};

const project = (overrides: Partial<RenderableProject> = {}): RenderableProject => ({
  creationDate: '2026-03-01',
  link: { icon: null, title: 'Cursor', url: 'https://cursor.com/@dyl' },
  thumbnail: { height: 400, url: 'https://images.test/cursor.jpg', width: 900 },
  title: 'Cursor',
  type: 'Website',
  ...overrides,
});

describe('CollageProjectFrame', () => {
  it('links the frame and shows type · year when both fields exist', () => {
    render(<CollageProjectFrame data-work-slot="c1" project={project()} style={style} />);

    expect(screen.getByRole('link', { name: /Cursor/ })).toHaveAttribute(
      'href',
      'https://cursor.com/@dyl',
    );
    expect(screen.getByRole('link', { name: /Cursor/ })).toHaveAttribute('data-work-slot', 'c1');
    expect(screen.getByRole('img', { name: 'Cursor' })).toHaveAttribute(
      'data-treatment',
      'project',
    );
    expect(screen.getByTestId('tag')).toHaveTextContent('Cursor');
    expect(screen.getByTestId('tag')).toHaveTextContent('Website · 2026');
  });

  it('omits meta and link role when those fields are absent', () => {
    render(
      <CollageProjectFrame
        project={project({ creationDate: null, link: null, type: null })}
        style={style}
      />,
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByTestId('tag')).toHaveTextContent('Cursor');
    expect(screen.getByTestId('tag').querySelector('small')).toBeNull();
  });
});

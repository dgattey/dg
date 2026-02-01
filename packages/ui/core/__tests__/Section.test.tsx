import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Section } from '../Section';

describe('Section', () => {
  it('forwards refs to a section element', () => {
    const ref = createRef<HTMLElement>();
    render(
      <Section ref={ref}>
        <span>Section content</span>
      </Section>,
    );

    expect(screen.getByText('Section content')).toBeInTheDocument();

    const current = ref.current;
    if (!current) {
      throw new Error('Ref not attached');
    }

    expect(current.tagName).toBe('SECTION');
  });
});

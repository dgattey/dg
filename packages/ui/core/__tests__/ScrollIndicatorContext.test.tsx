import { render, screen } from '@testing-library/react';
import { useContext } from 'react';
import { ScrollIndicatorContext } from '../ScrollIndicatorContext';

function ContextReader() {
  const isScrolled = useContext(ScrollIndicatorContext);
  return <span>{isScrolled ? 'on' : 'off'}</span>;
}

describe('ScrollIndicatorContext', () => {
  it('defaults to false', () => {
    render(<ContextReader />);
    expect(screen.getByText('off')).toBeInTheDocument();
  });

  it('supports provider overrides', () => {
    render(
      <ScrollIndicatorContext.Provider value={true}>
        <ContextReader />
      </ScrollIndicatorContext.Provider>,
    );
    expect(screen.getByText('on')).toBeInTheDocument();
  });
});

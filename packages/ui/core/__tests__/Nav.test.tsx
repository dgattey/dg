import { render, screen } from '@testing-library/react';
import { Nav, NavGroup, NavItem } from '../Nav';

describe('Nav', () => {
  it('renders semantic navigation structure', () => {
    render(
      <Nav>
        <NavGroup>
          <NavItem>First</NavItem>
          <NavItem>Second</NavItem>
        </NavGroup>
      </Nav>,
    );

    const nav = screen.getByRole('navigation');
    expect(nav.tagName).toBe('NAV');

    const list = screen.getByRole('list');
    const items = screen.getAllByRole('listitem');

    expect(list.tagName).toBe('UL');
    expect(items.map((item) => item.textContent)).toEqual(['First', 'Second']);
  });
});

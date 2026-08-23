/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { Typography } from '@mui/material';
import { GreenhouseTypeProvider } from '../GreenhouseTypeProvider';
import { getGreenhouseTypographyOverrides } from '../typography';

describe('GreenhouseTypeProvider', () => {
  it('scopes the greenhouse scale without changing :root type vars', () => {
    render(
      <GreenhouseTypeProvider>
        <Typography variant="h3">Title</Typography>
      </GreenhouseTypeProvider>,
    );

    expect(document.querySelector('[data-greenhouse-type]')).toBeTruthy();
    const title = screen.getByText('Title');
    expect(title).toHaveClass('MuiTypography-h3');
    const scale = getGreenhouseTypographyOverrides();
    expect(scale.h3?.fontWeight).toBe(500);
    expect(scale.h5?.fontWeight).toBe(400);
    expect(scale.overline?.letterSpacing).toBe('0.12em');
  });
});

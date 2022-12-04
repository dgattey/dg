import type { ColorScheme, SetColorScheme } from 'hooks/useColorScheme';
import { Moon, Sun } from 'lucide-react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

interface Props {
  /**
   * The color to switch to on click
   */
  scheme: ColorScheme;

  /**
   * If there's a theme and we want to allow clicks
   */
  hasTheme: boolean;

  /**
   * Function to change the user preferred scheme
   */
  updatePreferredScheme: SetColorScheme;
}

/**
 * Tooltips for the different states
 */
const TOOLTIPS: Record<ColorScheme, string> = {
  dark: 'Lights out',
  light: 'Sunny days!',
} as const;

/**
 * Maps color scheme to icon element
 */
const COLORED_ICONS: Record<ColorScheme, JSX.Element> = {
  dark: <Moon color="var(--secondary)" size="1em" />,
  light: <Sun color="var(--yellow)" size="1em" />,
};

/**
 * Uncolored icons for use elsewhere
 */
export const ICONS: Record<ColorScheme, JSX.Element> = {
  dark: <Moon size="1em" />,
  light: <Sun size="1em" />,
};

// Reset the state that tooltips give to the element since it acts as a button here.
const IconWrapper = styled.span<{ $disabled: boolean }>`
  && {
    & svg {
      font-size: 1.5em;
      transition: transform var(--transition);
      transform-origin: center;
    }
    ${({ $disabled }) =>
      $disabled
        ? css`
            cursor: not-allowed;
          `
        : css`
            cursor: pointer;
            & svg:hover {
              transform: rotate(45deg);
            }
          `}
    border-bottom: none;
  }
`;

/**
 * Creates an icon that is clickable to update to a preferred color scheme
 * if we have one that's set already. Otherwise, renders a disabled icon.
 */
function ColorSchemeIcon({ scheme, hasTheme, updatePreferredScheme }: Props) {
  return (
    <IconWrapper
      $disabled={!hasTheme}
      onClick={hasTheme ? () => updatePreferredScheme(scheme) : undefined}
      data-tooltip={hasTheme ? TOOLTIPS[scheme] : undefined}
    >
      {COLORED_ICONS[scheme]}
    </IconWrapper>
  );
}

export default ColorSchemeIcon;

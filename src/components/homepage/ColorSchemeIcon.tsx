import type { ColorScheme, SetColorScheme } from 'hooks/useColorScheme';
import styled, { css } from 'styled-components';

interface Props {
  /**
   * Data to show on hover
   */
  tooltip: string;

  /**
   * Children required and only one allowed
   */
  children: JSX.Element;

  /**
   * The color to switch to on click
   */
  inverted: ColorScheme;

  /**
   * If there's a theme and we want to allow clicks
   */
  hasTheme: boolean;

  /**
   * Function to change the user preferred scheme
   */
  updatePreferredScheme: SetColorScheme;
}

// Reset the state that tooltips give to the element since it acts as a button here.
const IconWrapper = styled.span<{ $disabled: boolean }>`
  && {
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
    & svg {
      font-size: 1.5em;
      transition: transform var(--transition);
      transform-origin: center;
    }
  }
`;

/**
 * Creates an icon that is clickable to update to a preferred color scheme
 * if we have one that's set already. Otherwise, renders a disabled icon.
 */
const ColorSchemeIcon = ({
  tooltip,
  children,
  inverted,
  hasTheme,
  updatePreferredScheme,
}: Props) => (
  <IconWrapper
    $disabled={!hasTheme}
    onClick={hasTheme ? () => updatePreferredScheme(inverted) : undefined}
    data-tooltip={hasTheme ? tooltip : undefined}
  >
    {children}
  </IconWrapper>
);

export default ColorSchemeIcon;

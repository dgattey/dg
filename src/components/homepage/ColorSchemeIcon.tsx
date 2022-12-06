import type { ColorSchemeMode } from 'hooks/useColorScheme';
import { Moon, Sun } from 'lucide-react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { ColorSchemeContext } from 'components/ColorSchemeContext';
import { useContext } from 'react';

interface ColorSchemeIconProps {
  /**
   * The color scheme mode to switch to on click
   */
  mode: ColorSchemeMode;
}

/**
 * Tooltips for the different states
 */
const TOOLTIPS: Record<ColorSchemeMode, string> = {
  dark: 'Lights out',
  light: 'Sunny days!',
} as const;

/**
 * Maps color scheme to icon element
 */
const COLORED_ICONS: Record<ColorSchemeMode, JSX.Element> = {
  dark: <Moon color="var(--secondary)" size="1em" />,
  light: <Sun color="var(--yellow)" size="1em" />,
};

/**
 * Uncolored icons for use elsewhere
 */
export const ICONS: Record<ColorSchemeMode, JSX.Element> = {
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
export function ColorSchemeIcon({ mode }: ColorSchemeIconProps) {
  const { colorScheme, updatePreferredMode } = useContext(ColorSchemeContext);
  return (
    <IconWrapper
      $disabled={!colorScheme.isInitialized}
      onClick={colorScheme.isInitialized ? () => updatePreferredMode(mode) : undefined}
      data-tooltip={colorScheme.isInitialized ? TOOLTIPS[mode] : undefined}
    >
      {COLORED_ICONS[mode]}
    </IconWrapper>
  );
}

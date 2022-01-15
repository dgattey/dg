import useColorScheme, { ColorScheme } from 'hooks/useColorScheme';
import { FiMoon, FiSun } from 'react-icons/fi';
import styled, { css } from 'styled-components';
import ContentCard from './ContentCard';
import Stack from './Stack';

// Stack items in center
const Card = styled(ContentCard)`
  --stack-gap: 2em;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: var(--stack-gap);
`;

// Magic value to place the switch exactly in the center of the card by offsetting the button height + spacing up
const ContentStack = styled(Stack)`
  margin-top: calc(var(--stack-gap) + 2.5em);
`;

// Provides color scheme specific variable names for the switch - unknown is basically just server-rendered
const SWITCH_COLOR_SCHEME_CSS: Record<ColorScheme | 'unknown', string> = {
  unknown: '--secondary',
  light: '--yellow',
  dark: '--navy',
};

// Combo of CSS + $colorScheme to set two separate states, using a lot of Pico CSS switch variables
const ColorSchemeSwitch = styled.input.attrs({ role: 'switch', type: 'checkbox' })<{
  $colorScheme: ColorScheme | null;
}>`
  ${({ $colorScheme }) => css`
    --switch-background-color: var(${SWITCH_COLOR_SCHEME_CSS[$colorScheme ?? 'unknown']});
  `};
  &&:checked {
    --calculated-margin: calc(var(--switch-width) - var(--switch-height));
    --border-color: var(--switch-background-color);
    --background-color: var(--switch-background-color);
    &:before {
      margin-left: var(--calculated-margin);
      margin-inline-start: var(--calculated-margin);
    }
  }
  && {
    --border-width: 6px;
    --switch-height: 2em;
    --switch-width: 4.5em;
    --switch-track-size: 1.25em;
    width: var(--switch-width);
    height: var(--switch-height);
    :before {
      width: calc(var(--switch-height) - (var(--border-width) * 2));
      transition: margin var(--transition);
    }
  }
`;

// Inline button that's not very prominent
const Button = styled.button<{ $visible: boolean }>`
  --border-radius: 2em;
  --form-element-spacing-vertical: 0.25em;
  --form-element-spacing-horizontal: 0.75em;
  font-size: 0.75em;
  display: inline-flex;
  gap: 0.5em;
  width: fit-content;
  transition: opacity var(--transition);
  && {
    ${({ $visible }) =>
      css`
        opacity: ${$visible ? 1 : 0};
      `};
  }
`;

// Reset the state that tooltips give to the element since it acts as a button here.
const ClickableIcon = styled.span`
  && {
    cursor: pointer;
    border-bottom: none;
    & svg {
      font-size: 1.5em;
      transition: transform var(--transition);
      transform-origin: center;
      :hover {
        transform: rotate(45deg);
      }
    }
  }
`;

/**
 * Inverts a "dark" or "light" value to the other
 */
const inverted = (colorScheme: ColorScheme) => (colorScheme === 'dark' ? 'light' : 'dark');

/**
 * Provides the ability to toggle the page's color scheme between
 * system, light, and dark. Prerendered, `colorScheme` is `light`
 * and `isSystemScheme` is true.
 */
const ColorSchemeToggleCard = () => {
  const { colorScheme, isSystemScheme, isInitializedWithSystemScheme, updatePreferredScheme } =
    useColorScheme();
  const setLightScheme = () => updatePreferredScheme('light');
  const setInvertedScheme = () => updatePreferredScheme(inverted(colorScheme));
  const setDarkScheme = () => updatePreferredScheme('dark');
  const clearSavedScheme = () => updatePreferredScheme(null);

  return (
    <Card>
      <ContentStack $gap="1em">
        <ClickableIcon onClick={setLightScheme} data-tooltip="Sun, up!">
          <FiSun color="var(--yellow)" />
        </ClickableIcon>
        <ColorSchemeSwitch
          disabled={!isInitializedWithSystemScheme}
          $colorScheme={!isInitializedWithSystemScheme ? null : colorScheme}
          onChange={setInvertedScheme}
          checked={isInitializedWithSystemScheme && colorScheme === 'dark'}
        />
        <ClickableIcon onClick={setDarkScheme} data-tooltip="Lights out">
          <FiMoon color="var(--secondary)" />
        </ClickableIcon>
      </ContentStack>
      <Button
        role="button"
        className="secondary outline"
        disabled={isSystemScheme}
        onClick={clearSavedScheme}
        $visible={!isSystemScheme}
      >
        Reset to system theme
      </Button>
    </Card>
  );
};

export default ColorSchemeToggleCard;

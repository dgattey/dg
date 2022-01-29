import ContentCard from 'components/ContentCard';
import Stack from 'components/Stack';
import useColorScheme, { ColorScheme } from 'hooks/useColorScheme';
import styled, { css } from 'styled-components';
import ColorSchemeIcon from './ColorSchemeIcon';

// Stack items in center
const Card = styled(ContentCard)`
  --stack-gap: 2em;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: var(--stack-gap);
`;

/**
 * Magic value to place the switch exactly in the center of the card by
 * offsetting the button height + spacing up. Makes sure transitions are
 * always enabled too, so switching color scheme does actually animate.
 */
const ContentStack = styled(Stack)`
  --transition: var(--transition-always-enabled);
  position: relative;
  margin: 4rem 0;
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
  `}
  && {
    --border-width: 6px;
    --switch-height: 2em;
    --switch-width: 4.5em;
    --switch-track-size: 1.25em;
    width: var(--switch-width);
    height: var(--switch-height);
  }

  &&:before {
    width: calc(var(--switch-height) - (var(--border-width) * 2));
    transition: margin var(--transition);
  }

  &&:checked {
    --calculated-margin: calc(var(--switch-width) - var(--switch-height));
    --border-color: var(--switch-background-color);
    --background-color: var(--switch-background-color);
    &:before {
      margin-left: var(--calculated-margin);
      margin-inline-start: var(--calculated-margin);
    }
  }
`;

// Inline button that's not very prominent
const Button = styled.button<{ $visible: boolean }>`
  --form-element-spacing-vertical: 0.5rem;
  --form-element-spacing-horizontal: 1rem;
  position: absolute;
  left: 1rem;
  right: 1rem;
  bottom: 1rem;
  margin: 0 auto;
  width: fit-content;
  transition: opacity var(--transition);
  @media (min-width: 768px) {
    bottom: 2rem;
  }
  && {
    ${({ $visible }) =>
      css`
        opacity: ${$visible ? 1 : 0};
      `}
  }
`;

/**
 * Provides the ability to toggle the page's color scheme between
 * system, light, and dark. Prerendered, `colorScheme` is `light`
 * and `isSystemScheme` is true.
 */
const ColorSchemeToggleCard = () => {
  const {
    colorScheme,
    isSystemScheme,
    isInitializedWithSystemScheme: hasTheme,
    updatePreferredScheme,
  } = useColorScheme();
  const setInvertedScheme = () => updatePreferredScheme(colorScheme === 'dark' ? 'light' : 'dark');
  const clearSavedScheme = () => updatePreferredScheme(null);

  return (
    <Card>
      <div>
        <ContentStack $gap="1em">
          <ColorSchemeIcon
            scheme="light"
            hasTheme={hasTheme}
            updatePreferredScheme={updatePreferredScheme}
          />
          <ColorSchemeSwitch
            disabled={!hasTheme}
            $colorScheme={!hasTheme ? null : colorScheme}
            onChange={setInvertedScheme}
            checked={hasTheme && colorScheme === 'dark'}
          />
          <ColorSchemeIcon
            scheme="dark"
            hasTheme={hasTheme}
            updatePreferredScheme={updatePreferredScheme}
          />
        </ContentStack>
        <Button
          role="button"
          className="secondary outline"
          disabled={isSystemScheme}
          onClick={clearSavedScheme}
          $visible={!isSystemScheme}
        >
          <small>Reset to system theme</small>
        </Button>
      </div>
    </Card>
  );
};

export default ColorSchemeToggleCard;

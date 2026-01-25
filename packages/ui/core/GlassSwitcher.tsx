import { Box, Radio, RadioGroup, Tooltip } from '@mui/material';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { bouncyTransition } from '../helpers/bouncyTransition';
import { mixinSx } from '../helpers/mixinSx';
import { useDebounce } from '../helpers/useDebounce';
import type { SxProps } from '../theme';
import { GlassContainer } from './GlassContainer';

interface ThumbStyles {
  height: number;
  left: number;
  top: number;
  width: number;
}

function getThumbStyles(item: HTMLElement | null | undefined): ThumbStyles | null {
  if (!item) {
    return null;
  }

  const { offsetLeft, offsetWidth, offsetHeight, offsetTop } = item;
  return {
    height: offsetHeight,
    left: offsetLeft,
    top: offsetTop,
    width: offsetWidth,
  };
}

interface SelectionThumbProps {
  thumbStyles: ThumbStyles;
  isAnimating: boolean;
  isResizing: boolean;
}

/**
 * Animated selection indicator that shows the current selection
 */
function SelectionThumb({ thumbStyles, isAnimating, isResizing }: SelectionThumbProps) {
  return (
    <Box
      sx={(theme) => ({
        backgroundColor: theme.vars.palette.action.selected,
        border: `1px solid color-mix(in srgb, ${theme.vars.palette.primary.main} 30%, transparent)`,
        borderRadius: theme.spacing(4),
        height: `calc(100% - ${theme.spacing(2)})`,
        opacity: isResizing ? 0 : 1,
        position: 'absolute',
        top: theme.spacing(1),
        transform: `${isAnimating ? `translateX(calc(${thumbStyles.left}px - ${theme.spacing(1)})) scaleX(1.25)` : `translateX(calc(${thumbStyles.left}px - ${theme.spacing(1)}))`}`,
        transformOrigin: 'center',
        ...bouncyTransition(theme, ['transform', 'background-color', 'opacity']),
        width: thumbStyles.width,
        zIndex: 0,

        [theme.breakpoints.down('sm')]: {
          flexDirection: 'column',
          height: thumbStyles.height,
          left: theme.spacing(1),
          transform: `${isAnimating ? `translateY(calc(${thumbStyles.top}px - ${theme.spacing(1)})) scaleX(1.25)` : `translateY(calc(${thumbStyles.top}px - ${theme.spacing(1)}))`}`,
          width: `calc(100% - ${theme.spacing(2)})`,
        },
      })}
    />
  );
}

interface SwitcherOptionProps {
  option: GlassSwitcherOption;
  isSelected: boolean;
  onChange: (value: string) => void;
  itemRef: (el: HTMLElement | null) => void;
}

/**
 * Individual option in the glass switcher
 */
function SwitcherOption({ option, isSelected, onChange, itemRef }: SwitcherOptionProps) {
  return (
    <Tooltip key={option.value} ref={itemRef} title={option.label}>
      <Box
        component="label"
        sx={(theme) => ({
          '& svg': {
            ...bouncyTransition(theme, 'scale'),
          },
          '&:hover': {
            '& svg': {
              scale: 1.25,
            },
            color: theme.vars.palette.primary.light,
            cursor: 'pointer',
          },
          alignItems: 'center',
          color: theme.vars.palette.primary.main,
          display: 'flex',
          justifyContent: 'center',
          minHeight: theme.spacing(6),
          minWidth: theme.spacing(6),
          padding: theme.spacing(0, 2.5),
          zIndex: 1,
        })}
      >
        <Radio
          checked={isSelected}
          onChange={(event) => onChange(event.target.value)}
          sx={{ display: 'none' }}
          value={option.value}
        />
        {option.icon}
      </Box>
    </Tooltip>
  );
}

/**
 * Custom hook to manage thumb positioning and animation
 */
function useThumbPosition(selectedIndex: number) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [thumbStyles, setThumbStyles] = useState<ThumbStyles>({
    height: 0,
    left: 0,
    top: 0,
    width: 0,
  });
  const itemRefs = useRef<Array<HTMLElement | null>>([]);

  // Update thumb position and trigger animation when selection changes
  useEffect(() => {
    const nextStyles = getThumbStyles(itemRefs.current[selectedIndex]);
    if (nextStyles) {
      setThumbStyles(nextStyles);
    }

    // Trigger scale animation
    setIsAnimating(true);
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 250); // Use standard short animation duration

    return () => clearTimeout(timer);
  }, [selectedIndex]);

  // Debounced resize handler
  const debouncedResizeComplete = useDebounce(() => {
    const nextStyles = getThumbStyles(itemRefs.current[selectedIndex]);
    if (nextStyles) {
      setThumbStyles(nextStyles);
    }
    setIsResizing(false);
  }, 300);

  // Handle window resize with proper debouncing and visual hiding
  useEffect(() => {
    const handleResize = () => {
      setIsResizing(true);
      debouncedResizeComplete();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [debouncedResizeComplete]);

  return {
    isAnimating,
    isResizing,
    itemRefs,
    thumbStyles,
  };
}

export interface GlassSwitcherOption {
  /**
   * The icon to display for this option
   */
  icon?: ReactNode;
  /**
   * Display label for the option
   */
  label: string;
  /**
   * Unique value identifier for the option
   */
  value: string;
}

export interface GlassSwitcherProps {
  /**
   * Currently selected option value
   */
  value: string;
  /**
   * Callback when the selection changes
   */
  onChange: (value: string) => void;
  /**
   * Array of options to display
   */
  options: Array<GlassSwitcherOption>;
  /**
   * Additional styling to apply to the container
   */
  sx?: SxProps;
  /**
   * Accessible label for the radio group
   */
  'aria-label'?: string;
}

/**
 * A generic switcher component that allows selection between N options with glass morphism styling.
 * Built on MUI RadioGroup for accessibility with a glass container background.
 */
export function GlassSwitcher({
  value,
  onChange,
  options,
  sx,
  'aria-label': ariaLabel,
}: GlassSwitcherProps) {
  const selectedIndex = options.findIndex((option) => option.value === value);
  const { isAnimating, isResizing, thumbStyles, itemRefs } = useThumbPosition(selectedIndex);

  return (
    <GlassContainer
      sx={mixinSx(
        (theme) => ({
          alignItems: 'center',
          display: 'flex',
          paddingBlock: theme.spacing(0.5),
          paddingInline: theme.spacing(1),
          position: 'relative',
          width: 'fit-content',

          [theme.breakpoints.down('sm')]: {
            paddingBlock: theme.spacing(1),
            paddingInline: theme.spacing(0.5),
          },
        }),
        sx,
      )}
    >
      <SelectionThumb isAnimating={isAnimating} isResizing={isResizing} thumbStyles={thumbStyles} />

      <RadioGroup
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.value)}
        row
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            flexDirection: 'column',
          },
        })}
        value={value}
      >
        {options.map((option, index) => (
          <SwitcherOption
            isSelected={value === option.value}
            itemRef={(el: HTMLElement | null) => {
              itemRefs.current[index] = el;
            }}
            key={option.value}
            onChange={onChange}
            option={option}
          />
        ))}
      </RadioGroup>
    </GlassContainer>
  );
}

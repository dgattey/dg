import type { SxProps as MuiSxProps, Theme } from '@mui/material/styles';
import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import type {} from '@mui/material/themeCssVarsAugmentation';
import type { SystemStyleObject } from '@mui/system';
import { unstable_prepareCssVars as prepareCssVars } from '@mui/system';
import deepmerge from '@mui/utils/deepmerge';
import { getShadows } from './extraShadows';
import { getGlass } from './glass';
import { getPalette } from './palette';
import { getShape } from './shape';
import { getTypography } from './typography';

/**
 * Use this everywhere where theme support is needed.
 */
export type SxProps = MuiSxProps<Theme>;

/**
 * Object-only version of SxProps - use this for base style constants
 * that will be combined with other sx props via arrays.
 * This avoids TypeScript issues with nested arrays.
 */
export type SxObject = SystemStyleObject<Theme>;

/**
 * Single sx element - objects only, NOT arrays or theme functions.
 * Use this for component `sx` props when you want to combine with base styles.
 */
export type SxElement = SxObject;

export const themeSelectorAttribute = 'data-theme';
export const themeCookieName = 'color-scheme';
export const themePreferenceAttribute = 'data-theme-preference';

const defaultColorScheme = 'light' as const;

const mergeStyleSheets = (styleSheets: Array<Record<string, unknown>>) =>
  styleSheets.reduce((acc, sheet) => deepmerge(acc, sheet), {});

const getSystemPreferenceStyles = (theme: Theme) => {
  const systemSelector = `html[${themePreferenceAttribute}="system"]:not([${themeSelectorAttribute}])`;
  const defaultScheme = theme.defaultColorScheme ?? 'light';
  const { generateStyleSheets } = prepareCssVars(theme, {
    colorSchemeSelector: 'media',
    getSelector: (colorScheme, css) => {
      if (!colorScheme) {
        return systemSelector;
      }
      if (colorScheme === defaultScheme) {
        return systemSelector;
      }
      const scheme = theme.colorSchemes?.[colorScheme as keyof typeof theme.colorSchemes] as
        | { palette?: { mode?: string } }
        | undefined;
      const mode = scheme?.palette?.mode ?? String(colorScheme);
      return {
        [`@media (prefers-color-scheme: ${mode})`]: {
          [systemSelector]: css,
        },
      };
    },
    prefix: theme.cssVarPrefix ?? 'mui',
  });

  return mergeStyleSheets(generateStyleSheets());
};

/**
 * Our MUI theme, customized, and dark/light mode compatible.
 */
export function getTheme(): Theme {
  const minimalThemeOptions = {
    breakpoints: {
      values: {
        lg: 992,
        md: 768,
        sm: 576,
        xl: 1200,
        xs: 0,
      },
    },
    colorSchemes: {
      dark: {
        extraShadows: getShadows('dark'),
        glass: getGlass('dark'),
        palette: getPalette('dark'),
      },
      light: {
        extraShadows: getShadows('light'),
        glass: getGlass('light'),
        palette: getPalette('light'),
      },
    },
    cssVariables: {
      colorSchemeSelector: themeSelectorAttribute,
    },
    defaultColorScheme,
    extraShadows: getShadows(defaultColorScheme),
    glass: getGlass(defaultColorScheme),
    shape: getShape(),
  };
  const minimalTheme = createTheme(minimalThemeOptions);

  // Now we can inject in a basic theme for spacing
  const typography = getTypography(minimalTheme);
  const themeWithColorMode = createTheme({
    ...minimalThemeOptions,
    components: {
      MuiButton: {
        defaultProps: {
          variant: 'contained',
        },
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: theme.spacing(1),
            textTransform: 'initial',
          }),
          sizeLarge: ({ theme }) => ({
            fontSize: theme.typography.pxToRem(13),
            padding: theme.spacing(1, 2.5),
          }),
          sizeMedium: ({ theme }) => ({
            fontSize: theme.typography.pxToRem(12),
            padding: theme.spacing(0.75, 2),
          }),
          sizeSmall: ({ theme }) => ({
            fontSize: theme.typography.pxToRem(11),
            padding: theme.spacing(0.5, 1.5),
          }),
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            background: theme.vars.palette.background.paper,
            borderColor: theme.vars.palette.card.border,
            borderRadius: theme.spacing(4),
            borderStyle: 'solid',
            borderWidth: 'thin',
            boxShadow: theme.vars.extraShadows.card.main,
          }),
        },
      },
      MuiChip: {
        defaultProps: {
          size: 'medium',
          variant: 'outlined',
        },
        styleOverrides: {
          sizeMedium: {
            fontSize: '0.9rem',
            height: 28,
          },
          sizeSmall: {
            fontSize: '0.7rem',
            height: 20,
          },
        },
      },
      MuiContainer: {
        defaultProps: {
          fixed: true,
        },
        styleOverrides: {
          root: ({ theme }) => ({
            [theme.breakpoints.up('sm')]: {
              maxWidth: 510,
              paddingLeft: 0,
              paddingRight: 0,
            },
            [theme.breakpoints.up('md')]: {
              maxWidth: 700,
            },
            [theme.breakpoints.up('lg')]: {
              maxWidth: 920,
            },
            [theme.breakpoints.up('xl')]: {
              maxWidth: 1130,
            },
          }),
        },
      },
      MuiCssBaseline: {
        styleOverrides: (theme) => ({
          ...getSystemPreferenceStyles(theme),
          '::view-transition-new(main-content)': {
            animation: 'fade-in 0.3s ease-in 0.1s both',
          },
          // Sheet content slides up when entering
          '::view-transition-new(sheet-content)': {
            animation: 'sheet-slide-up 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
          },
          // Main content fades during transitions
          '::view-transition-old(main-content)': {
            animation: 'fade-out 0.2s ease-out',
          },
          // Default root transition - subtle fade
          '::view-transition-old(root), ::view-transition-new(root)': {
            animationDuration: '0.25s',
          },
          // Sheet content slides down when leaving
          '::view-transition-old(sheet-content)': {
            animation: 'sheet-slide-down 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
          },
          // Header stays pinned during transitions (no animation)
          '::view-transition-old(site-header), ::view-transition-new(site-header)': {
            animation: 'none',
            mixBlendMode: 'normal',
          },
          ':root': {
            // Ensure while swapping themes, we have no animations
            ':root[data-animations-enabled="false"] *': {
              transition: 'none',
            },
            fontVariant: 'tabular-nums',
            wordBreak: 'break-word',
            [theme.breakpoints.up('sm')]: {
              fontSize: 16,
            },
            [theme.breakpoints.up('md')]: {
              fontSize: 17,
            },
            [theme.breakpoints.up('lg')]: {
              fontSize: 18,
            },
            [theme.breakpoints.up('xl')]: {
              fontSize: 19,
            },
          },
          '@keyframes fade-in': {
            from: { opacity: 0 },
            to: { opacity: 1 },
          },
          '@keyframes fade-out': {
            from: { opacity: 1 },
            to: { opacity: 0 },
          },
          '@keyframes sheet-slide-down': {
            from: {
              opacity: 1,
              transform: 'translateY(0)',
            },
            to: {
              opacity: 0,
              transform: 'translateY(100%)',
            },
          },
          // View Transitions API - Sheet animations
          '@keyframes sheet-slide-up': {
            from: {
              opacity: 0,
              transform: 'translateY(100%)',
            },
            to: {
              opacity: 1,
              transform: 'translateY(0)',
            },
          },
          body: {
            overscrollBehaviorX: 'none',
          },
          html: {
            scrollbarGutter: 'stable',
          },
          'html, body': {
            overflowX: 'clip',
            width: '100%',
          },
        }),
      },
      MuiLink: {
        defaultProps: {
          underline: 'hover',
          variant: 'body1',
        },
        styleOverrides: {
          root: ({ theme, ownerState: { color } }) => {
            if (typeof color !== 'string') {
              return {};
            }
            const paletteColor =
              color in theme.vars.palette
                ? theme.vars.palette[color as 'primary' | 'secondary' | 'info' | 'success']
                : null;
            if (!paletteColor) {
              return {};
            }
            return {
              '&:hover': {
                color: paletteColor.dark,
              },
              color: paletteColor.main,
              transition: theme.transitions.create('color'),
            };
          },
        },
      },
      MuiSkeleton: {
        styleOverrides: {
          root: ({ theme }) => ({
            '&.MuiSkeleton-rounded': {
              borderRadius: theme.spacing(1),
            },
          }),
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: ({ theme }) => ({
            ...theme.typography.caption,
            background: theme.vars.palette.background.paper,
            borderColor: theme.vars.palette.card.border,
            borderRadius: theme.spacing(1.5),
            borderStyle: 'solid',
            borderWidth: 'thin',
            boxShadow: theme.vars.extraShadows.card.main,
            color: theme.vars.palette.text.primary,
            padding: theme.spacing(0.5, 1.25),
          }),
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            textRendering: 'optimizeLegibility',
            // Resets the original value
            WebkitFontSmoothing: 'auto',
          },
        },
        variants: [
          {
            props: { variant: 'code' },
            style: ({ theme }) => ({
              background: theme.vars.palette.background.paper,
              color: theme.vars.palette.text.secondary,
            }),
          },
          {
            props: { variant: 'h1' },
            style: ({ theme }) => ({
              color: theme.vars.palette.text.h1,
            }),
          },
          {
            props: { variant: 'h2' },
            style: ({ theme }) => ({
              color: theme.vars.palette.text.h2,
            }),
          },
          {
            props: { variant: 'h3' },
            style: ({ theme }) => ({
              color: theme.vars.palette.text.h3,
            }),
          },
          {
            props: { variant: 'h4' },
            style: ({ theme }) => ({
              color: theme.vars.palette.text.h4,
            }),
          },
          {
            props: { variant: 'h5' },
            style: ({ theme }) => ({
              color: theme.vars.palette.text.h5,
            }),
          },
          {
            props: { variant: 'h6' },
            style: ({ theme }) => ({
              color: theme.vars.palette.text.h6,
            }),
          },
          {
            props: { variant: 'body1' },
            style: ({ theme }) => ({
              color: theme.vars.palette.text.primary,
            }),
          },
          {
            props: { variant: 'body2' },
            style: ({ theme }) => ({
              color: theme.vars.palette.text.secondary,
            }),
          },
        ],
      },
    },
    typography,
  });

  return responsiveFontSizes(themeWithColorMode, {
    variants: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'caption', 'overline', 'body1', 'body2', 'code'],
  });
}

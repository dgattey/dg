import type { SxProps as MuiSxProps, Theme } from '@mui/material/styles';
import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import type {} from '@mui/material/themeCssVarsAugmentation';
import type { SystemStyleObject } from '@mui/system';
import { onCanvas } from './color';
import { COLOR_SCHEME_ATTRIBUTE } from './colorScheme';
import { getShadows } from './extraShadows';
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

const shouldSkipGeneratingVar = (keys: Array<string>) => keys.at(-1)?.endsWith('Channel') === true;

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
    cssVariables: {
      disableCssColorScheme: true,
      shouldSkipGeneratingVar,
    },
    extraShadows: getShadows(),
    palette: getPalette(),
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
          ':root': {
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
          body: {
            overscrollBehaviorX: 'none',
          },
          html: {
            colorScheme: 'light dark',
            scrollbarGutter: 'stable',
            textWrap: 'pretty',
          },
          [`html[${COLOR_SCHEME_ATTRIBUTE}="dark"]`]: {
            colorScheme: 'dark',
          },
          [`html[${COLOR_SCHEME_ATTRIBUTE}="light"]`]: {
            colorScheme: 'light',
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
      MuiMenuItem: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              backgroundColor:
                'color-mix(in srgb, var(--mui-palette-primary-main) 12%, transparent)',
            },
            '&.Mui-selected:hover': {
              backgroundColor:
                'color-mix(in srgb, var(--mui-palette-primary-main) 16%, transparent)',
            },
          },
        },
      },
      MuiSkeleton: {
        styleOverrides: {
          root: ({ theme }) => ({
            '&.MuiSkeleton-rounded': {
              borderRadius: theme.spacing(1),
            },
            backgroundColor: onCanvas(12),
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

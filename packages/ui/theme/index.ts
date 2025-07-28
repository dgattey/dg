import type { SxProps as MuiSxProps, Theme } from '@mui/material/styles';
import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import type {} from '@mui/material/themeCssVarsAugmentation';
import { getShadows } from './extraShadows';
import { getPalette } from './palette';
import { getShape } from './shape';
import { getTypography } from './typography';

/**
 * Use this everywhere where theme support is needed.
 */
export type SxProps = MuiSxProps<Theme>;

export const themeSelectorAttribute = 'data-theme';

/**
 * Our MUI theme, customized, and dark/light mode compatible.
 */
export function getTheme(): Theme {
  const minimalThemeOptions = {
    cssVariables: {
      colorSchemeSelector: themeSelectorAttribute,
    },
    colorSchemes: {
      light: {
        palette: getPalette('light'),
        extraShadows: getShadows('light'),
      },
      dark: {
        palette: getPalette('dark'),
        extraShadows: getShadows('dark'),
      },
    },
    shape: getShape(),
    breakpoints: {
      values: {
        xs: 0,
        sm: 576,
        md: 768,
        lg: 992,
        xl: 1200,
      },
    },
    extraShadows: getShadows('light'),
  };
  const minimalTheme = createTheme(minimalThemeOptions);

  // Now we can inject in a basic theme for spacing
  const typography = getTypography(minimalTheme);
  const themeWithColorMode = createTheme({
    ...minimalThemeOptions,
    typography,
    components: {
      MuiCssBaseline: {
        styleOverrides: (theme) => ({
          ':root': {
            wordBreak: 'break-word',
            fontVariant: 'tabular-nums',
            // Ensure while swapping themes, we have no animations
            ':root[data-animations-enabled="false"] *': {
              transition: 'none',
            },
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
        }),
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
      MuiTypography: {
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
        styleOverrides: {
          root: {
            // Resets the original value
            WebkitFontSmoothing: 'auto',
            textRendering: 'optimizeLegibility',
          },
        },
      },
      MuiLink: {
        defaultProps: {
          variant: 'body1',
          underline: 'hover',
        },
        styleOverrides: {
          root: ({ theme, ownerState: { color } }) => {
            if (typeof color !== 'string') {
              return {};
            }
            const paletteColor =
              color in theme.vars.palette
                ? theme.vars.palette[
                    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                    color as 'primary' | 'secondary' | 'info' | 'success'
                  ]
                : null;
            if (!paletteColor) {
              return {};
            }
            return {
              color: paletteColor.main,
              transition: theme.transitions.create('color'),
              '&:hover': {
                color: paletteColor.dark,
              },
            };
          },
        },
      },
      MuiButton: {
        defaultProps: {
          variant: 'contained',
        },
        styleOverrides: {
          root: ({ theme }) => ({
            textTransform: 'initial',
            borderRadius: theme.spacing(1),
            padding: theme.spacing(0.75, 2),
          }),
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            background: theme.vars.palette.background.paper,
            borderRadius: theme.spacing(4),
            borderColor: theme.vars.palette.card.border,
            borderWidth: 'thin',
            borderStyle: 'solid',
            boxShadow: theme.vars.extraShadows.card.main,
          }),
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: ({ theme }) => ({
            ...theme.typography.caption,
            background: theme.vars.palette.background.paper,
            borderRadius: theme.spacing(1.5),
            borderColor: theme.vars.palette.card.border,
            borderWidth: 'thin',
            borderStyle: 'solid',
            boxShadow: theme.vars.extraShadows.card.main,
            padding: theme.spacing(0.5, 1.25),
            color: theme.vars.palette.text.primary,
          }),
        },
      },
    },
  });

  return responsiveFontSizes(themeWithColorMode, {
    variants: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'caption', 'overline', 'body1', 'body2', 'code'],
  });
}

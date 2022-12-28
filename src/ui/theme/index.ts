import type {} from '@mui/material/themeCssVarsAugmentation';
import { responsiveFontSizes, Theme, SxProps as MuiSxProps } from '@mui/material';
import {
  CssVarsTheme,
  CssVarsThemeOptions,
  experimental_extendTheme as extendTheme,
} from '@mui/material/styles';
import { getShape } from 'ui/theme/shape';
import { getTypography } from 'ui/theme/typography';
import { getShadows } from './extraShadows';
import { getPalette } from './palette';

type AugmentedTheme = Omit<Theme, 'palette' | 'components'> & CssVarsTheme;

/**
 * Use this everywhere where theme support is needed.
 */
export type SxProps = MuiSxProps<AugmentedTheme>;

/**
 * Our MUI theme, customized, and dark/light mode compatible.
 */
export function getTheme(): Theme {
  const minimalThemeOptions: CssVarsThemeOptions = {
    cssVarPrefix: '',
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
  };
  const minimalTheme = extendTheme(minimalThemeOptions);

  // Now we can inject in a basic theme for spacing
  const typography = getTypography(minimalTheme);
  const themeWithColorMode = extendTheme({
    ...minimalThemeOptions,
    typography,
    components: {
      MuiCssBaseline: {
        styleOverrides: (theme) => ({
          ':root': {
            wordBreak: 'break-word',
            // Ensure while swapping themes, we have no animations
            ':root[data-animations-enabled="false"] *': {
              transition: 'none',
            },
            [theme.breakpoints.up('sm')]: {
              fontSize: 17,
            },
            [theme.breakpoints.up('md')]: {
              fontSize: 18,
            },
            [theme.breakpoints.up('lg')]: {
              fontSize: 19,
            },
            [theme.breakpoints.up('xl')]: {
              fontSize: 20,
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
              background: theme.vars.palette.code.background,
              color: theme.vars.palette.code.text,
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
              // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
              theme.vars.palette[color as 'primary' | 'secondary' | 'warning' | 'info' | 'success'];
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
            borderRadius: theme.spacing(6),
            padding: theme.spacing(1, 3),
          }),
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            background: theme.vars.palette.card.background,
            borderRadius: theme.spacing(6),
            borderColor: theme.vars.palette.card.border,
            borderWidth: 1,
            borderStyle: 'solid',
            boxShadow: theme.vars.extraShadows.card.main,
          }),
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: ({ theme }) => ({
            ...theme.typography.caption,
            background: theme.vars.palette.card.background,
            borderRadius: theme.spacing(6),
            borderColor: theme.vars.palette.card.border,
            borderWidth: 1,
            borderStyle: 'solid',
            boxShadow: theme.shadows[2],
            padding: theme.spacing(0.5, 1.5),
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

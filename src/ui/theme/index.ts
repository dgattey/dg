import { responsiveFontSizes, Theme, SxProps as MuiSxProps } from '@mui/material';
import {
  CssVarsTheme,
  CssVarsThemeOptions,
  experimental_extendTheme as extendTheme,
} from '@mui/material/styles';
import { getGrid } from 'ui/theme/grid';
import { getPalette } from 'ui/theme/palette';
import { getTypography } from 'ui/theme/typography';
import { getShadows } from './shadows';

type AugmentedTheme = Omit<Theme, 'palette' | 'components'> & CssVarsTheme;

/**
 * Use this everywhere where theme support is needed.
 */
export type SxProps = MuiSxProps<AugmentedTheme>;

/**
 * Our MUI theme, customized, and dark/light mode compatible.
 */
export const getTheme = (mode: PaletteMode) => {
  const minimalThemeOptions: ThemeOptions = {
    palette: getPalette(mode),
    extraShadows: getShadows(mode),
    grid: getGrid(),
    borderRadius: {
      card: '2.5em',
    },
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
  const minimalTheme = createTheme(minimalThemeOptions);

  // Now we can inject in a basic theme for colors/spacing
  const typography = getTypography(mode, minimalTheme);
  const themeWithColorMode = createTheme({
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
              theme.palette[color as 'primary' | 'secondary' | 'warning' | 'info' | 'success'];
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
            borderRadius: theme.borderRadius.card,
            padding: theme.spacing(1, 3),
          }),
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            background: theme.palette.card.background,
            borderRadius: theme.borderRadius.card,
            borderColor: theme.palette.card.border,
            borderWidth: 1,
            borderStyle: 'solid',
            boxShadow: theme.extraShadows.card.main,
          }),
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: ({ theme }) => ({
            ...theme.typography.caption,
            background: theme.palette.card.background,
            borderRadius: theme.borderRadius.card,
            borderColor: theme.palette.card.border,
            borderWidth: 1,
            borderStyle: 'solid',
            boxShadow: theme.shadows[2],
            padding: theme.spacing(0.5, 1.5),
            color: theme.palette.text.primary,
          }),
        },
      },
    },
  });

  return responsiveFontSizes(themeWithColorMode, {
    variants: [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'caption',
      'overline',
      'body1',
      'body2',
      'code',
      'button',
    ],
  });
};

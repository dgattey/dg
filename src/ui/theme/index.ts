import { createTheme, PaletteMode, responsiveFontSizes } from '@mui/material';
import { getPalette } from 'ui/theme/palette';
import { getTypography } from 'ui/theme/typography';
import { getShadows } from './shadows';

/**
 * Our MUI theme, customized, and dark/light mode compatible.
 */
export const getTheme = (mode: PaletteMode) => {
  const shadows = getShadows(mode);
  const themeWithColorMode = createTheme({
    palette: getPalette(mode),
    typography: getTypography(mode),
    extraShadows: shadows,
    breakpoints: {
      values: {
        xs: 0,
        sm: 576,
        md: 768,
        lg: 992,
        xl: 1200,
      },
    },
    components: {
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
            borderRadius: '2.5em',
            padding: theme.spacing(1, 3),
          }),
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            background: theme.palette.card.background,
            borderRadius: '2.5em',
            borderColor: theme.palette.card.border,
            borderWidth: 1,
            borderStyle: 'solid',
            boxShadow: shadows.card.main,
          }),
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: ({ theme }) => ({
            ...theme.typography.caption,
            background: theme.palette.card.background,
            borderRadius: '2.5em',
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

  return responsiveFontSizes(themeWithColorMode);
};

import '@mui/material';

type NonNullableColor = NonNullable<React.CSSProperties['color']>;
type NonNullableBoxShadow = NonNullable<React.CSSProperties['boxShadow']>;

declare module '@mui/material/styles' {
  /**
   * Adds custom shadow types defined in `ui/theme/shadows.ts`
   */
  type ExtraShadows = {
    card: {
      main: NonNullableBoxShadow;
      hovered: NonNullableBoxShadow;
      overlayHovered: NonNullableBoxShadow;
    };
    map: {
      control: NonNullableBoxShadow;
    };
  };

  /**
   * Glass effect percentage values for light/dark mode adaptations.
   * Pre-computed for use in color-mix() CSS functions.
   */
  type Glass = {
    lightBorder: string;
    lightInset1: string;
    lightInset2: string;
    lightInset3: string;
    lightInset4: string;
    darkInset1: string;
    darkInset2: string;
    darkInset3: string;
    darkInset4: string;
    darkShadow1: string;
    darkShadow2: string;
  };

  type CardColors = {
    border: NonNullableColor;
  };
  type MapColors = {
    markerBackground: NonNullableColor;
    markerBorder: NonNullableColor;
  };

  interface Palette {
    card: CardColors;
    map: MapColors;
  }
  interface PaletteOptions {
    card: CardColors;
    map: MapColors;
  }
  interface Theme {
    shape: {
      gridGap: number;
      gridGapLarge: number;
      gridItemDimension: number;
      gridItemSize: (span: number) => string;
    };
  }
  interface ThemeOptions {
    shape: {
      gridGap: number;
      gridGapLarge: number;
      gridItemDimension: number;
      gridItemSize?: (span: number) => string;
    };
  }

  interface ThemeVars {
    extraShadows: ExtraShadows;
    glass: Glass;
  }

  interface ColorSystemOptions {
    extraShadows: ExtraShadows;
    glass: Glass;
  }

  interface TypographyVariants {
    code: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    code?: React.CSSProperties;
  }

  interface TypeText {
    primary: string;
    h1: string;
    h2: string;
    h3: string;
    h4: string;
    h5: string;
    h6: string;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    code: true;
    subtitle1: false;
    subtitle2: false;
  }
}

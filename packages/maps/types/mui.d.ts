/* eslint-disable @typescript-eslint/consistent-type-definitions */
import '@mui/material';

type NonNullableColor = NonNullable<React.CSSProperties['color']>;
type NonNullableBoxShadow = NonNullable<React.CSSProperties['boxShadow']>;
type NonNullableBorderRadius = NonNullable<React.CSSProperties['borderRadius']>;

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
  }

  interface ColorSystemOptions {
    extraShadows: ExtraShadows;
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

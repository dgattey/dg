import '@mui/material';

type NonNullableColor = NonNullable<React.CSSProperties['color']>;
type NonNullableBoxShadow = NonNullable<React.CSSProperties['boxShadow']>;
type NonNullableBorderRadius = NonNullable<React.CSSProperties['borderRadius']>;

declare module '@mui/material/styles' {
  interface Palette {
    active: Palette['primary'];
    card: {
      background: NonNullableColor;
      border: NonNullableColor;
    };
    code: {
      background: NonNullableColor;
      text: NonNullableColor;
    };
    map: {
      markerBackground: NonNullableColor;
      markerBorder: NonNullableColor;
    };
  }
  interface PaletteOptions {
    active: PaletteOptions['primary'];
    card: {
      background: NonNullableColor;
      border: NonNullableColor;
    };
    code: {
      background: NonNullableColor;
      text: NonNullableColor;
    };
    map: {
      markerBackground: NonNullableColor;
      markerBorder: NonNullableColor;
    };
  }
  interface Theme {
    extraShadows: {
      card: {
        main: NonNullableBoxShadow;
        hovered: NonNullableBoxShadow;
        overlayHovered: NonNullableBoxShadow;
      };
      map: {
        control: NonNullableBoxShadow;
      };
    };
    borderRadius: {
      card: NonNullableBorderRadius;
    };
    grid: {
      gap: number;
      gapLarge: number;
      contentDimension: number;
      cardSizeInRem: (span: number) => string;
    };
  }
  interface ThemeOptions {
    extraShadows: {
      card: {
        main: NonNullableBoxShadow;
        hovered: NonNullableBoxShadow;
        overlayHovered: NonNullableBoxShadow;
      };
      map: {
        control: NonNullableBoxShadow;
      };
    };
    borderRadius: {
      card: NonNullableBorderRadius;
    };
    grid: {
      gap: number;
      gapLarge: number;
      contentDimension: number;
      cardSizeInRem?: (span: number) => string;
    };
  }
  interface TypographyVariants {
    code: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    code?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    code: true;
    subtitle1: false;
    subtitle2: false;
  }
}

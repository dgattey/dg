import '@mui/material';

type NonNullableColor = NonNullable<React.CSSProperties['color']>;

declare module '@mui/material/styles' {
  interface Palette {
    active: Palette['primary'];
    card: {
      background: NonNullableColor;
      border: NonNullableColor;
    };
  }
  interface PaletteOptions {
    active: PaletteOptions['primary'];
    card: {
      background: NonNullableColor;
      border: NonNullableColor;
    };
  }
  interface Theme {
    extraShadows: {
      card: {
        main: NonNullable<React.CSSProperties['boxShadow']>;
        hovered: NonNullable<React.CSSProperties['boxShadow']>;
      };
    };
  }
  interface ThemeOptions {
    extraShadows: {
      card: {
        main: NonNullable<React.CSSProperties['boxShadow']>;
        hovered: NonNullable<React.CSSProperties['boxShadow']>;
      };
    };
  }
}

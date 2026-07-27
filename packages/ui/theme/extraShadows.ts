const shadows = {
  card: {
    hovered:
      '0 0.125rem 2rem rgba(0, 0, 0, 0.06),0 0.125rem 4rem rgba(0, 0, 0, 0.12),0 0 0 0.125rem rgba(0, 0, 0, 0.036)',
    main: '0.0145rem 0.029rem 0.174rem rgba(0,0,0,.017),0.0335rem 0.067rem 0.402rem rgba(0,0,0,.024),0.0625rem 0.125rem 0.75rem rgba(0,0,0,.03),0.1125rem 0.225rem 1.35rem rgba(0,0,0,.036),0.2085rem 0.417rem 2.502rem rgba(0,0,0,.043),0.5rem 1rem 6rem rgba(0,0,0,.06),0 0 0 0.0625rem rgba(0,0,0,.015)',
    overlayHovered: '0 0 4px rgba(0, 0, 0, 0.1), 0 0 8px rgba(0, 0, 0, 0.16)',
  },
  map: {
    control: '0 0 0 2px rgba(0, 0, 0, 0.1)',
  },
} as const;

export const getShadows = () => shadows;

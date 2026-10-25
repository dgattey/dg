export type TypographyRole =
  | 'display-hero'
  | 'display-cut'
  | 'display-page'
  | 'stat-xl'
  | 'stat-lg'
  | 'stat-md'
  | 'title-md'
  | 'label'
  | 'title-sm'
  | 'row-title'
  | 'badge'
  | 'stamp'
  | 'prose-lg'
  | 'prose'
  | 'meta'
  | 'caption'
  | 'code';

export type TypographyRoleSpec = {
  family: 'var(--display)' | 'var(--body)' | 'var(--font-mono)';
  leading: string;
  size: string;
  tracking?: string;
  weight: 400 | 600 | 700;
};

export const FONT_STACK_SANS = [
  'system-ui',
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'Roboto',
  'Ubuntu',
  'Cantarell',
  '"Noto Sans"',
  'sans-serif',
  '"Apple Color Emoji"',
  '"Segoe UI Emoji"',
  '"Segoe UI Symbol"',
  '"Noto Color Emoji"',
].join(',');

export const FONT_STACK_MONO = [
  '"Menlo"',
  '"Consolas"',
  '"Roboto Mono"',
  '"Ubuntu Monospace"',
  '"Noto Mono"',
  '"Oxygen Mono"',
  '"Liberation Mono"',
  'monospace',
  '"Apple Color Emoji"',
  '"Segoe UI Emoji"',
  '"Segoe UI Symbol"',
  '"Noto Color Emoji"',
].join(',');

export const TYPOGRAPHY_ROLES: Record<TypographyRole, TypographyRoleSpec> = {
  badge: {
    family: 'var(--display)',
    leading: 'var(--leading-tight)',
    size: 'var(--type-caption)',
    weight: 700,
  },
  caption: {
    family: 'var(--body)',
    leading: 'var(--leading-meta)',
    size: 'var(--type-caption)',
    weight: 600,
  },
  code: {
    family: 'var(--font-mono)',
    leading: 'var(--leading-body)',
    size: 'var(--type-meta)',
    weight: 400,
  },
  'display-cut': {
    family: 'var(--display)',
    leading: '0.94',
    size: 'var(--type-display)',
    tracking: '0.01em',
    weight: 700,
  },
  'display-hero': {
    family: 'var(--display)',
    leading: '0.94',
    size: 'var(--type-display)',
    tracking: 'var(--tracking-display)',
    weight: 700,
  },
  'display-page': {
    family: 'var(--display)',
    leading: '0.96',
    size: 'var(--type-h1)',
    tracking: 'var(--tracking-display)',
    weight: 700,
  },
  label: {
    family: 'var(--display)',
    leading: 'var(--leading-tight)',
    size: 'var(--type-label)',
    tracking: 'var(--tracking-label)',
    weight: 700,
  },
  meta: {
    family: 'var(--body)',
    leading: 'var(--leading-meta)',
    size: 'var(--type-meta)',
    weight: 600,
  },
  prose: {
    family: 'var(--body)',
    leading: 'var(--leading-body)',
    size: 'var(--type-body)',
    weight: 400,
  },
  'prose-lg': {
    family: 'var(--body)',
    leading: 'var(--leading-body)',
    size: 'var(--type-body-lg)',
    weight: 400,
  },
  'row-title': {
    family: 'var(--display)',
    leading: 'var(--leading-title)',
    size: 'var(--type-body)',
    weight: 700,
  },
  stamp: {
    family: 'var(--display)',
    leading: 'var(--leading-tight)',
    size: 'var(--type-micro)',
    tracking: '0.01em',
    weight: 700,
  },
  'stat-lg': {
    family: 'var(--display)',
    leading: 'var(--leading-tight)',
    size: 'var(--type-title-lg)',
    tracking: 'var(--tracking-title)',
    weight: 700,
  },
  'stat-md': {
    family: 'var(--display)',
    leading: 'var(--leading-tight)',
    size: 'var(--type-title-md)',
    tracking: 'var(--tracking-title)',
    weight: 700,
  },
  'stat-xl': {
    family: 'var(--display)',
    leading: '0.94',
    size: 'var(--type-display-md)',
    tracking: 'var(--tracking-display)',
    weight: 700,
  },
  'title-md': {
    family: 'var(--display)',
    leading: 'var(--leading-title)',
    size: 'var(--type-h2)',
    tracking: 'var(--tracking-label)',
    weight: 700,
  },
  'title-sm': {
    family: 'var(--display)',
    leading: 'var(--leading-title)',
    size: 'var(--type-h3)',
    tracking: 'var(--tracking-label)',
    weight: 700,
  },
};

export function getTypography(): Record<TypographyRole, TypographyRoleSpec> {
  return TYPOGRAPHY_ROLES;
}

import { BackgroundPattern } from 'og/BackgroundPattern';
import { COLORS } from 'ui/theme/color';

export const TEXT_FONT = 'SF Pro Text';
export const LOGO_FONT = 'SF Pro Text Black';

/**
 * Approximates the actual logo with some scaling
 */
function Logo() {
  return (
    <div
      style={{
        fontFamily: `'${LOGO_FONT}'`,
        letterSpacing: '-0.12em',
        fontSize: 128,
        color: COLORS.PRIMARY,
        transformOrigin: 'left center',
        transform: 'scale(1.2, 1)',
        marginBottom: 64,
        alignSelf: 'flex-end',
        marginRight: 64,
      }}
    >
      dg.
    </div>
  );
}

/**
 * Creates an image using the Vercel edge runtime for an
 * Open Graph response. Contains DG branding and some text.
 */
export function OpenGraphImage({ text, subtitle }: { text: string; subtitle: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 64,
        paddingTop: 96,
        height: '100%',
        width: '100%',
        background: COLORS.DARK.DEFAULT_BACKGROUND,
        color: COLORS.DARK.TEXT,
        fontSize: 64,
        fontFamily: `'${TEXT_FONT}'`,
      }}
    >
      <BackgroundPattern />
      <Logo />
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        {text}
        <div
          style={{
            fontSize: 42,
            color: COLORS.MUTED_TEXT,
            marginTop: 8,
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
}

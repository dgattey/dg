import { COLORS } from 'ui/theme/color';
import { BackgroundPattern } from './BackgroundPattern';

export const TEXT_FONT = 'SF Pro';
export const LOGO_FONT = 'SF Pro Display Heavy';

/**
 * Approximates the actual logo with some scaling
 */
function Logo() {
  return (
    <div
      style={{
        fontFamily: `'${LOGO_FONT}'`,
        letterSpacing: '-0.12em',
        fontSize: 132,
        color: COLORS.DARK.PRIMARY,
        transformOrigin: 'left center',
        transform: 'scale(1.2, 1)',
        marginBottom: 64,
        alignSelf: 'flex-end',
        marginRight: 96,
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
        color: COLORS.DARK.H5,
        fontSize: 56,
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
            fontSize: 40,
            fontStretch: '125%',
            color: COLORS.DARK.MUTED_TEXT,
            marginTop: 8,
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
}

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
        alignSelf: 'flex-end',
        color: COLORS.DARK.PRIMARY,
        fontFamily: `'${LOGO_FONT}'`,
        fontSize: 132,
        letterSpacing: '-0.12em',
        marginBottom: 64,
        marginRight: 96,
        transform: 'scale(1.2, 1)',
        transformOrigin: 'left center',
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
        background: COLORS.DARK.DEFAULT_BACKGROUND,
        color: COLORS.DARK.H5,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: `'${TEXT_FONT}'`,
        fontSize: 56,
        height: '100%',
        padding: 64,
        paddingTop: 96,
        width: '100%',
      }}
    >
      <BackgroundPattern />
      <Logo />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        {text}
        <div
          style={{
            color: COLORS.DARK.MUTED_TEXT,
            fontSize: 40,
            fontStretch: '125%',
            marginTop: 8,
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
}

import { BRAND_PAIRS } from '@dg/ui/theme/color';
import { BackgroundPattern } from './BackgroundPattern';
import { LOGO_FONT, TEXT_FONT } from './ogFonts';

/**
 * Approximates the actual logo with some scaling
 */
function Logo() {
  return (
    <div
      style={{
        alignSelf: 'flex-end',
        color: BRAND_PAIRS.primary[1],
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
        background: BRAND_PAIRS.defaultBackground[1],
        color: BRAND_PAIRS.h5[1],
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
            color: BRAND_PAIRS.mutedText[1],
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

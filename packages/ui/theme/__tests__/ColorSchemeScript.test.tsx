import { renderToStaticMarkup } from 'react-dom/server';
import { ColorSchemeScript } from '../ColorSchemeScript';
import { COLOR_SCHEME_INIT_SCRIPT } from '../colorScheme';

describe('ColorSchemeScript', () => {
  it('ships the init script verbatim, with no HTML escaping of its quotes or &&', () => {
    expect(renderToStaticMarkup(<ColorSchemeScript />)).toBe(
      `<script>${COLOR_SCHEME_INIT_SCRIPT}</script>`,
    );
  });
});

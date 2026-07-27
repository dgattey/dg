import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { COLOR_SCHEME_ATTRIBUTE, COLOR_SCHEME_STORAGE_KEY } from '@dg/ui/theme/colorScheme';

describe('color-scheme-init.js', () => {
  it('uses the same storage key and attribute as theme constants', () => {
    const script = readFileSync(join(__dirname, '../../../public/color-scheme-init.js'), 'utf8');
    expect(script).toContain(`localStorage.getItem('${COLOR_SCHEME_STORAGE_KEY}')`);
    expect(script).toContain(`setAttribute('${COLOR_SCHEME_ATTRIBUTE}'`);
  });
});

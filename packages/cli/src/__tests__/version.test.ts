import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { extractNotes } from '../version.js';

describe('extractNotes', () => {
  it('extracts notes from standard # What changed? template section', () => {
    const body = [
      '# What changed?',
      '',
      '- Added binary cover uploads to `/api/books/sync`.',
      '- Returned normalized `coverImageUrl`.',
      '',
      '# Release info',
      '',
      '- [ ] Major',
      '- [ ] Minor',
      '- [x] Patch',
    ].join('\n');

    assert.equal(
      extractNotes(body),
      [
        '- Added binary cover uploads to `/api/books/sync`.',
        '- Returned normalized `coverImageUrl`.',
      ].join('\n'),
    );
  });

  it('supports What changed at any heading level and strips HTML comments and trailing --- footers', () => {
    const body = [
      '<!-- CURSOR_AGENT_PR_BODY_BEGIN -->',
      '## What changed?',
      '',
      '- Restored `music.css` and `devConsole.css` imports.',
      '',
      '---',
      'Footer metadata',
      '<!-- CURSOR_AGENT_PR_BODY_END -->',
    ].join('\r\n');

    assert.equal(extractNotes(body), '- Restored `music.css` and `devConsole.css` imports.');
  });

  it('falls back to body without Release info when What changed heading is absent', () => {
    const body = [
      '<!-- CURSOR_AGENT_PR_BODY_BEGIN -->',
      '## Summary',
      '- Add `coverImageBase64` + `coverImageContentType` support to `/api/books/sync`.',
      '- Validate raw standard base64 payloads.',
      '',
      '# Release info',
      '- [ ] Major',
      '- [ ] Minor',
      '- [x] Patch',
      '<!-- CURSOR_AGENT_PR_BODY_END -->',
    ].join('\n');

    assert.equal(
      extractNotes(body),
      [
        '## Summary',
        '- Add `coverImageBase64` + `coverImageContentType` support to `/api/books/sync`.',
        '- Validate raw standard base64 payloads.',
      ].join('\n'),
    );
  });

  it('uses fallback when body has no notes content', () => {
    const templateOnly = ['# What changed?', '', '- ', '', '# Release info', '- [x] Patch'].join(
      '\n',
    );

    assert.equal(
      extractNotes(templateOnly, '- Fix release note extraction'),
      '- Fix release note extraction',
    );
    assert.equal(
      extractNotes('', '- Fix release note extraction'),
      '- Fix release note extraction',
    );
  });
});

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

  it('falls back to ## Summary when # What changed? is absent and stops before ## Verification', () => {
    const body = [
      '<!-- CURSOR_AGENT_PR_BODY_BEGIN -->',
      '## Summary',
      '- Add `coverImageBase64` + `coverImageContentType` support to `/api/books/sync`.',
      '- Validate raw standard base64 payloads.',
      '',
      '## Verification',
      '- `pnpm --filter @dg/services test` passed.',
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
        '- Add `coverImageBase64` + `coverImageContentType` support to `/api/books/sync`.',
        '- Validate raw standard base64 payloads.',
      ].join('\n'),
    );
  });

  it('supports ## What changed? and ## What changed headings at h2 level', () => {
    const withQuestion = [
      '## What changed?',
      '',
      '- Restored `music.css` and `devConsole.css` imports.',
      '',
      '---',
      'Footer metadata',
    ].join('\n');

    const withoutQuestion = [
      '## What changed',
      '',
      '- Added fallback headings for release note extraction.',
      '',
      '# Release info',
      '- [x] Patch',
    ].join('\n');

    assert.equal(
      extractNotes(withQuestion),
      '- Restored `music.css` and `devConsole.css` imports.',
    );
    assert.equal(
      extractNotes(withoutQuestion),
      '- Added fallback headings for release note extraction.',
    );
  });

  it('falls back to body lines or PR title when no known section heading is present', () => {
    const plainBody = [
      'Closes #123',
      '',
      '- Direct bullet summary without heading.',
      '',
      '# Release info',
      '- [x] Patch',
    ].join('\n');

    assert.equal(extractNotes(plainBody), '- Direct bullet summary without heading.');
    assert.equal(extractNotes('', 'Fix release note extraction'), '- Fix release note extraction');
  });
});

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  compareSemver,
  computeNext,
  extractNotes,
  extractReleaseNotesSection,
  parseReleaseType,
  pickHighestSemverTag,
  resolveTargetVersion,
} from '../version.js';

describe('extractNotes', () => {
  it('prefers # Release notes over ## What changed when both are present', () => {
    const body = [
      '## What changed',
      '',
      '- Updated `packages/cli/src/version.ts` and `PULL_REQUEST_TEMPLATE.md`.',
      '',
      '# Release notes',
      '',
      '<!-- comment -->',
      '- Release notes on the changelog now read as plain-English summaries instead of raw code diffs (#693).',
      '',
      '# Release info',
      '',
      '- [ ] Major',
      '- [ ] Minor',
      '- [x] Patch',
    ].join('\n');

    assert.equal(
      extractReleaseNotesSection(body),
      '- Release notes on the changelog now read as plain-English summaries instead of raw code diffs (#693).',
    );
    assert.equal(
      extractNotes(body),
      '- Release notes on the changelog now read as plain-English summaries instead of raw code diffs (#693).',
    );
  });

  it('extracts notes from standard # What changed? template section when # Release notes is absent or empty', () => {
    const body = [
      '# What changed?',
      '',
      '- Added binary cover uploads to `/api/books/sync`.',
      '- Returned normalized `coverImageUrl`.',
      '',
      '# Release notes',
      '',
      '- ',
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

describe('version resolution from tags and PR checkboxes', () => {
  it('sorts semver tags numerically rather than lexicographically', () => {
    assert.ok(compareSemver('2.81.1', '2.9.1') > 0);
    assert.equal(
      pickHighestSemverTag(['refs/tags/v2.9.1', 'refs/tags/v2.81.1', 'refs/tags/v2.80.3']),
      '2.81.1',
    );
  });

  it('computes major, minor, and patch target versions from the highest tag', () => {
    assert.equal(parseReleaseType('- [x] Major'), 'major');
    assert.equal(parseReleaseType('- [X] Minor'), 'minor');
    assert.equal(parseReleaseType('- [x] Patch'), 'patch');
    assert.equal(computeNext('2.81.1', 'patch'), '2.81.2');
    assert.equal(computeNext('2.81.1', 'minor'), '2.82.0');
    assert.equal(computeNext('2.81.1', 'major'), '3.0.0');

    assert.deepEqual(
      resolveTargetVersion({
        fallbackVersion: '2.80.0',
        latestTag: '2.81.1',
        prBody: '# Release info\n- [x] Minor',
      }),
      {
        base: '2.81.1',
        releaseType: 'minor',
        target: '2.82.0',
      },
    );
  });
});

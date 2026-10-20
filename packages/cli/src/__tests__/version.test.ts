import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildReleasePlan,
  bumpVersion,
  compareVersions,
  extractNotes,
  parseReleaseType,
} from '../version.js';

describe('version CLI helpers', () => {
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
        '- Added local `version:release-pr` fallback command.',
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
        '- Added local `version:release-pr` fallback command.',
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
      assert.equal(
        extractNotes('', 'Fix release note extraction'),
        '- Fix release note extraction',
      );
    });
  });

  describe('parseReleaseType and bumpVersion', () => {
    it('parses Major, Minor, and default Patch checkboxes', () => {
      assert.equal(parseReleaseType('- [x] Major\n- [ ] Minor\n- [ ] Patch'), 'major');
      assert.equal(parseReleaseType('- [ ] Major\n- [X] Minor\n- [ ] Patch'), 'minor');
      assert.equal(parseReleaseType('- [ ] Major\n- [ ] Minor\n- [x] Patch'), 'patch');
      assert.equal(parseReleaseType('No checkboxes at all'), 'patch');
    });

    it('bumps and compares semantic versions', () => {
      assert.equal(bumpVersion('2.72.1', 'patch'), '2.72.2');
      assert.equal(bumpVersion('2.72.1', 'minor'), '2.73.0');
      assert.equal(bumpVersion('2.72.1', 'major'), '3.0.0');
      assert.ok(compareVersions('2.72.2', '2.72.1') > 0);
      assert.equal(compareVersions('2.72.1', 'v2.72.1'), 0);
    });
  });

  describe('buildReleasePlan', () => {
    it('computes next version from latest tag when PR merged without pre-merge bot bump', () => {
      const plan = buildReleasePlan(
        {
          body: '## Summary\n- Local release support\n\n# Release info\n- [x] Patch',
          headRefName: 'dgattey/local-release-70aa',
          mergeCommitOid: '9c46c602e101c112bf51cd1f68db35c2fa6ab54d',
          number: 641,
          state: 'MERGED',
          title: 'Add local release command',
          url: 'https://github.com/dgattey/dg/pull/641',
        },
        {
          latestTag: '2.72.1',
          mergedPackageVersion: '2.72.1',
        },
      );

      assert.equal(plan.version, '2.72.2');
      assert.equal(plan.releaseType, 'patch');
      assert.equal(plan.notes, '- Local release support');
      assert.equal(plan.targetCommitish, '9c46c602e101c112bf51cd1f68db35c2fa6ab54d');
    });

    it('honors explicit bumpTypeOverride when cutting a release locally', () => {
      const plan = buildReleasePlan(
        {
          body: '# What changed?\n- Minor feature\n\n# Release info\n- [x] Patch',
          headRefName: 'dgattey/feature-70aa',
          mergeCommitOid: 'abc1234',
          number: 642,
          state: 'MERGED',
          title: 'Minor feature',
          url: 'https://github.com/dgattey/dg/pull/642',
        },
        {
          bumpTypeOverride: 'minor',
          latestTag: '2.72.1',
          mergedPackageVersion: '2.72.1',
        },
      );

      assert.equal(plan.version, '2.73.0');
      assert.equal(plan.releaseType, 'minor');
    });
  });
});

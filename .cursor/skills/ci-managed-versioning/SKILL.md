---
name: ci-managed-versioning
description: Prevents manual version bumps in this repository. Use whenever changing package manifests, release metadata, changelogs, tags, or preparing commits and pull requests that could affect versions.
---

# CI-Managed Versioning

Release versions are derived from semver git tags and the PR template checkboxes (`Major`, `Minor`, `Patch`), not from branch edits to the root `package.json`.

## How release versioning works

- `.github/workflows/release.yml` runs two jobs:
  - `📦 Bump version` on open PRs: parses the checked `Major` / `Minor` / `Patch` box in the PR body, computes the next semver version from the highest `v*` git tag, and updates the PR comment (`🎉 This PR will be included in version X.Y.Z 🎉`) without committing to the PR branch.
  - `🚀 Create release` when a PR merges to `main`: computes the target version from the highest `v*` git tag and the PR body checkbox, creates the `vX.Y.Z` GitHub Release at `merge_commit_sha`, and updates the PR comment.
- At build time, `apps/web/next.config.ts` resolves `NEXT_PUBLIC_APP_VERSION` from the repository's remote semver tags (`git ls-remote --tags --refs`) and the commit's `# Release info` checkbox so production and preview builds render the exact release version in `Footer.tsx` (`getAppVersionInfo()`) without mutating `package.json`.

## Rules

1. **Never edit `version` in the root `package.json`.**
2. **Never run `npm version`, `pnpm version`, or any local version bump command.**
3. **Always check the appropriate `Major`, `Minor`, or `Patch` box under `# Release info` in the PR body.**
4. **If an older branch has a legacy `github-actions[bot]` `Bump version to v...` commit**, strip it and rebase onto `origin/main` with `pnpm exec turbo drop-bot-commits`.

[![GitHub version](https://badgen.net/github/release/dgattey/dg)](https://github.com/dgattey/dg) [![Vercel](https://therealsujitk-vercel-badge.vercel.app/?app=dg)](https://vercel.com/dgattey/dg) [![Factor][fcr-img]][fcr] [![Climate][cc-img]][cc] [![Lines of Code](https://badgen.net/codeclimate/loc/dgattey/dg)][cc] [![Scan](https://snyk.io/test/github/dgattey/dg/badge.svg)](https://snyk.io/test/github/dgattey/dg)

# Dylan Gattey

Portfolio/project showcase website for Dylan Gattey as a lightweight, mobile-friendly React app, powered by NextJS and Contentful. It's hosted on [Vercel](https://vercel.com), backed by [Cloudflare](https://cloudflare.com), with continuous integration based off this repo.

## Initial Setup

Make sure Node 14+ and `yarn` is installed. Run `yarn` to install all existing dependencies.

## Local Development

`yarn dev` starts the NextJS development server.

### Pull Requests

Code review uses PRs and branch development:

1. Create a feature branch (`git checkout -b feature-name`)

1. Commit code on a local branch with a descriptive name (`git commit -am 'Adds a great new feature'`)

1. Push to the branch (`git push origin feature-name`)

1. Try to make sure there's an [issue](https://github.com/dgattey/dg/issues) tracking something you're fixing with this pull request (encouraged)

1. [Create a new pull request](https://github.com/dgattey/dg/pulls) using a provided template if there's one that matches what you need

1. Ensure the assignee is correct, that the [labels](https://github.com/dgattey/dg/labels) on the pull request reflect the change, and that the appropriate [milestone](https://github.com/dgattey/dg/milestones) is set. Also ensure the [project](https://github.com/dgattey/dg/projects/) reflects the change.

1. Your request will kick off quality, safety, and linting automated checks from [CodeClimate](https://codeclimate.com/), [CodeFactor](https://www.codefactor.io), [DeepScan](https://deepscan.io), and [Stickler CI](https://stickler-ci.com/)

1. Once all checks pass and a human reviews your code, it will be rebased and merged onto `main` and the branch deleted! :tada:

Please follow the [Contribution Guidelines](CONTRIBUTING.md) at all times.

## Continuous Integration

### DNS/CDN

[Cloudflare](https://cloudflare.com) manages DNS/security, & [Vercel](https://vercel.com) is the CI server that hosts the site. Cloudflare's MX records point to Gmail.

### Deployment

Every commit to `main` triggers a new deploy & publish on Vercel :tada:. Merging a PR will trigger a build for you. If you want a manual deploy, you can log in to Vercel and trigger one.

## Issues

The currently open [issues](https://github.com/dgattey/dg/issues) reflect the top priority tasks. Each one has appropriate [labels](https://github.com/dgattey/dg/labels) set and are categorized into an appropriate [milestone](https://github.com/dgattey/dg/milestones).

To [open a new issue](https://github.com/dgattey/dg/issues/new/choose), use one of the existing templates for clarity. This should set most of the properties for you. Add relevant details and the project/milestone, and you're all set. Issues are a requirement for a new pull request.

### Versioning

I use `semantic-release` and standard Conventional Commits for semver versioning.

- **Major**: bumped if "!" appears after the subject of the commit message
- **Minor**: bumped if "feat:" appears in the message
- **Patch**: bumped by default in all other cases ("chore:"/"fix:"/etc)

[cc-img]: https://badgen.net/codeclimate/tech-debt/dgattey/dg
[cc]: https://codeclimate.com/github/dgattey/dg/maintainability
[fcr-img]: https://www.codefactor.io/repository/github/dgattey/dg/badge
[fcr]: https://www.codefactor.io/repository/github/dgattey/dg

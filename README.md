[![GitHub version](https://badgen.net/github/release/dgattey/dg?cache=600)][gh] [![Vercel](https://therealsujitk-vercel-badge.vercel.app/?app=dg)](https://vercel.com/dgattey/dg) [![Climate][cc-img]][cc] [![Quality](https://badgen.net//codeclimate/maintainability/dgattey/dg)][cc] [![Lines of Code](https://badgen.net/codeclimate/loc/dgattey/dg)][cc] [![GitHub checks](https://badgen.net/github/checks/dgattey/dg)][gh] [![Last commit](https://badgen.net/github/last-commit/dgattey/dg/main)][gh]

# Dylan Gattey

Portfolio/project showcase website for Dylan Gattey as a lightweight, mobile-friendly React app, powered by NextJS and Contentful. It's hosted on [Vercel](https://vercel.com), backed by [Cloudflare](https://cloudflare.com), with continuous integration based off this repo.

## Initial Setup

- `yarn dev` starts the development server.
- `yarn build` runs a prod build after generating new Prisma types
- `yarn start` runs a server assuming the site has been previously built
- `yarn format` runs Prettier to format the files
- `yarn lint` runs ESLint to lint all TS(X) and JS(X) files
- `yarn lint:styles` runs stylelint on the same files
- `yarn lint:types` runs tsc to confirm no type errors on the same files
- `yarn codegen` generates new GraphQL APIs from Github/Contentful
- `yarn db:local <branch>` (assuming you have `pscale` installed locally) connects you to the DB branch specified on port 3309
- `yarn db:sync` (assuming the db is currently connected) syncs the schemas to the db branch so you can promote to main through PlanetScale
- `yarn db:generate` (assuming the db is currently connected) generates schema changes locally to the package
- `yarn release` bumps the site version, run via Github Action

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
[gh]: https://github.com/dgattey/dg

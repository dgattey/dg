[![GitHub version](https://badgen.net/github/release/dgattey/dg)](https://github.com/dgattey/dg) [![Vercel](https://therealsujitk-vercel-badge.vercel.app/?app=dg)](https://vercel.com/dgattey/dg) [![Factor][fcr-img]][fcr] [![Climate][cc-img]][cc] [![Lines of Code](https://badgen.net/codeclimate/loc/dgattey/dg)][cc] [![Scan](https://badgen.net/snyk/dgattey/dg)](https://app.snyk.io/org/dgattey/project/86857699-68d3-4e45-b120-8714196cf328)

# Dylan Gattey

This is a redesign of <https://dylangattey.com> to a lightweight, mobile-friendly, polished exhibition of my projects/experiments. It's been a slow, unchanging Wordpress site for years. I'm using a static site generator, [Jekyll](https://jekyllrb.com/), to build it. It's hosted on [Netlify](https://netlify.com), backed by [Cloudflare](https://cloudflare.com), with continuous integration based off this repo.

## Initial Setup

### Development Dependencies

You must have the following already installed:

- `HomeBrew`
- `Ruby` & `RubyGems` (`rvm` is a great tool for managing versions)
- `ImageOptim`
- `npm` to install `PurgeCSS`

### Setup script

Once the above are manually installed, you can simply run the `setup.sh` script to install the following:

- `Bundler`

- `ImageMagick` (make sure `webp` appears under delegates, if not and you're on Linux, try [this guide](https://github.com/rosell-dk/webp-convert/wiki/Installing-Imagick-extension))

- `PurgeCSS`

## Local Development

### Workflow

1. Install the necessary gems with `bundle install`
1. Build & serve the site with `bundle exec jekyll serve`

The site files will live in `_site` and be served on `http://localhost:4000/`.

### Adding a new dependency

Add an entry to the Gemfile, add to `plugins` in `_config.yml` as needed and rerun `bundle install`.

### Changing/adding images

The `design` folder contains all the project's Sketch files with some screenshots/other types of files that are design related. If adding new images, please add the source files to `design`. All assets for site usage should be created into `src/_assets/img` or `src/_assets/icons`, then processed.

Use the `process-images.sh` script after adding an image. It will optimize/minify all image files. Additionally, it will convert those files to WebP versions and put them back in the same folders. This allows `jekyll-assets` to properly copy all those files on build. It can take _FOREVER_ to run ImageOptim, so be patient. Running the script once will optimize or re-optimize all images.

## Committing Code

We exclusively use branch-based development in this repo, combined with pull requests that run automated checks.

### Branches

The main branch is `master`, which is unpushable without a pull request. New branches are created on the fly for various PRs.

### Pull Requests

Ready for a code review? Follow these steps:

1. Create a feature branch (`git checkout -b feature-name`)

1. Commit code on a local branch with a descriptive name (`git commit -am 'Adds a great new feature'`)

1. Push to the branch (`git push origin feature-name`)

1. Try to make sure there's an [issue](https://github.com/dgattey/dg/issues) tracking something you're fixing with this pull request (encouraged)

1. [Create a new pull request](https://github.com/dgattey/dg/pulls) using a provided template if there's one that matches what you need

1. Ensure the assignee is correct, that the [labels](https://github.com/dgattey/dg/labels) on the pull request reflect the change, and that the appropriate [milestone](https://github.com/dgattey/dg/milestones) is set. Also ensure the [project](https://github.com/dgattey/dg/projects/) reflects the change.

1. Your request will kick off quality, safety, and linting automated checks from [CodeClimate](https://codeclimate.com/), [CodeFactor](https://www.codefactor.io), [DeepScan](https://deepscan.io), and [Stickler CI](https://stickler-ci.com/)

1. Once all checks pass and a human reviews your code, it will be rebased and merged onto `master` and the branch deleted! :tada:

Please follow the [Contribution Guidelines](CONTRIBUTING.md) at all times.

## Continuous Integration

### DNS/CDN

We're set up with [Cloudflare](https://cloudflare.com) managing DNS & [Netlify](https://netlify.com) as the CDN and CI server that hosts the site. Cloudflare's MX records point to [ZohoMail](https://zoho.com/mail), and points to Netlify as the site source. Headers/redirects are set up via `netlify.toml` rules. There are other CDNs used, mostly Google's for analytics and Adobe Fonts for the webfont files.

### Deployment

Every commit to `master` triggers a new deploy & publish on Netlify :tada:. By default, it uses `JEKYLL_ENV=production bundle exec jekyll build` with some nice defaults. Merging a PR to `master` will trigger a build for you. If you want a manual deploy, you can log in to Netlify and trigger one.

## Issues

The currently open [issues](https://github.com/dgattey/dg/issues) reflect the top priority tasks. Each one has appropriate [labels](https://github.com/dgattey/dg/labels) set and are categorized into an appropriate [milestone](https://github.com/dgattey/dg/milestones).

To [open a new issue](https://github.com/dgattey/dg/issues/new/choose), use one of the existing templates for clarity. This should set most of the properties for you. Add relevant details and the project/milestone, and you're all set. Issues are a requirement for a new pull request.

## Project Status

Project status is tracked under the [main project](https://github.com/dgattey/dg/projects/2). Our milestones are reflected in our version tags on particular commits and are as follows.

- [x] [1.0](https://github.com/dgattey/dg/milestone/2): basic site up on Netlify/Cloudflare with barebones homepage.

- [ ] [2.0](https://github.com/dgattey/dg/milestone/1): the meat of the site, where all content is done, most styling done, and site is secure for the most part.

- [ ] [2.x](https://github.com/dgattey/dg/milestone/3): putting the cherry on top! Polish, security, optimizations are all finished and site is done.

- [ ] [Future](https://github.com/dgattey/dg/milestone/4): future work, tracking aspirations and ideas.

### Semver Tagging

Nothing useful was out there to automate semver tagging of commits to a repo so I built something myself. Using [Hook.io](https://hook.io), I created a webhook that runs automatically on push events from this repo. When that push happens, I run a small Node.js app, `autotag.js` [(from this Gist)][autotag] to do the processing.

Bumping works by parsing the commit message:

- **Major**: bumped if "bumps major version" appears in the message
- **Minor**: bumped if "bumps minor version" appears in the message
- **Patch**: bumped by default in all other cases

On a new push to (protected) `master`, the webhook will trigger and autotag will

1. Verify it's a push to master
1. Grab the latest tag from the repo
1. Confirm the tag is a semver tag
1. Increment the tag's version based on the commit message
1. Push the new tag to master

The speed of it means that Netlify will probably read this new tag by the time it tries to build the site, meaning that the version tag on the site will actually be up to date :tada:.

### Current integrations

- Google Analytics: setup through Jekyll plugin

- Google Search Console: uploaded a `google*.html` file to the root, plus fallback through the SEO plugin + a value in `_config.yml`

- Sitemap: through a plugin, excluding the `google*.html` file via blob in the config

- Autoprefixer: plugin + asset plugin based

- SEO: plugin based

- Assets: plugin based

- PurgeCSS: intalled on Netlify via build task

- Linting: through a **bunch** of Github integrations

[autotag]: https://gist.github.com/dgattey/ed969ae192d1335e1e04924b7721d5f5
[cc-img]: https://badgen.net/codeclimate/tech-debt/dgattey/dg
[cc]: https://codeclimate.com/github/dgattey/dg/maintainability
[fcr-img]: https://www.codefactor.io/repository/github/dgattey/dg/badge
[fcr]: https://www.codefactor.io/repository/github/dgattey/dg

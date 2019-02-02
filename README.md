[![Netlify][nlfy-img]][nlfy] [![Codacy][cdy-img]][cdy] [![Factor][fcr-img]][fcr]
[![Climate][cc-img]][cc] [![Scan][deep-img]][deep]

# Dylan Gattey

This is a redesign of <https://dylangattey.com> to a lightweight,
mobile-friendly, polished exhibition of my projects/experiments. It's been
a slow, unchanging Wordpress site for years. I'm using a static site
generator, [Jekyll](https://jekyllrb.com/), to build it. It's hosted on
[Netlify](https://netlify.com), backed by [Cloudflare](https://cloudflare.com),
with continuous integration based off this repo.

## Initial Setup

### Development Dependencies

You must have the following already installed:

- `HomeBrew`
- `Ruby` & `RubyGems` (`rvm` is a great tool for managing versions)
- `ImageOptim`
- `npm` to install `PurgeCSS`

### Setup script

Once the above are manually installed, you can simply run the `setup` script
to install the following:

- `Bundler`

- `ImageMagick` (make sure `webp` appears under delegates, if not and you're
  on Linux, try [this guide](https://github.com/rosell-dk/webp-convert/wiki/Installing-Imagick-extension))

- `PurgeCSS`

## Local Development

### Workflow

1. Install the necessary gems with `bundle install`
1. Build & serve the site with `bundle exec jekyll serve`

If you want autoreload, use `bundle exec jekyll liveserve`. The site files will
live in `build` and be served on `http://localhost:4000/`.

### Adding a new dependency

Add an entry to the Gemfile, add to `plugins` in `_config.yml` as needed and
rerun `bundle install`.

### Changing/adding images

Use the `process-images` script after doing so. It will optimize/minify all jpg/png
files. Additionally, it will convert those files to WebP versions and put them back
in the same folders. This allows `jekyll-assets` to properly copy all those files
on build. It can take _FOREVER_ to run ImageOptim, so be patient. Also, you may need
to run the script multiple times to get the best results.

### Committing something

We use feature branches in this repo + pull requests.
[Create a PR](https://github.com/dgattey/dg/pulls), using a provided template
if possible. If possible, referencing an
[issue](https://github.com/dgattey/dg/issues) that tracks the problem is optimal.
We use [labels](https://github.com/dgattey/dg/labels) to categorize, and
[milestones](https://github.com/dgattey/dg/milestones) to track dependencies.
Please follow the
[Contribution Guidelines](https://github.com/dgattey/dg/blob/master/CONTRIBUTING.md)
at all times.

## DNS, CDN, and Deployment

We're set up with [Cloudflare](https://cloudflare.com) managing DNS &
[Netlify](https://netlify.com) as the CDN and CI server that hosts the site.
Cloudflare's MX records point to [ZohoMail](https://zoho.com/mail), and points to
Netlify as the site source. Headers/redirects are set up via `netlify.toml` rules.

### Deployment

Every commit to `master` branch triggers a new deploy & publish on Netlify :tada:.
By default, it uses `JEKYLL_ENV=production bundle exec jekyll build`. Merging a
PR to `master` will trigger a build for you. If you want a manual deploy, you can
log in to Netlify and trigger one.

## Pull Requests, Issues, and Status

The project is tracked by this repo. All gaps in content and bugs are captured
in [issues](https://github.com/dgattey/dg/issues), with the appropriate labels.
To merge code, you must [create a PR](https://github.com/dgattey/dg/pulls)
using a feature branch, get your code reviewed, and run the automated checks.
Once finished, you can rebase on master, push, and delete the branch directly
from the PR. Status is tracked under the
[main project](https://github.com/dgattey/dg/projects/2), with
[milestones](https://github.com/dgattey/dg/milestones) to keep track of progress.

Versions/milestones are as follows:

- ~[1.0 (Marrow)](https://github.com/dgattey/dg/milestone/2): basic site up on
  Netlify/Cloudflare with barebones homepage~

- [1.5 (Steak)](https://github.com/dgattey/dg/milestone/1): the "meat" 😉 of the
  site, where all content is done, most styles done, and site is secure for the
  most part

- [2.0 (Cherry)](https://github.com/dgattey/dg/milestone/3): putting the cherry
  on top! Polish, security, optimizations are all finished and site is done

- [3.0 (Moon Grape)](https://github.com/dgattey/dg/milestone/3): future work,
  tracking aspirations and ideas

### Current integrations

- Google Analytics: setup through Jekyll plugin

- Google Search Console: uploaded a `google*.html` file to the root, plus
  fallback through the SEO plugin + a value in `_config.yml`

- Adobe Fonts (née Typekit)

- Sitemap: through a plugin, excluding the `google*.html` file via blob
  in the config

- Autoprefixer: plugin + asset plugin based

- SEO: plugin based

- Assets: plugin based

- PurgeCSS: intalled on Netlify via build task

- Linting: through a **bunch** of Github integrations

[nlfy-img]: https://api.netlify.com/api/v1/badges/45e36541-7c61-4931-bd4e-3a654b199044/deploy-status
[nlfy]: https://app.netlify.com/sites/dgattey/deploys
[cdy-img]: https://api.codacy.com/project/badge/Grade/2b996737e14d4377ac4b03f7dc84f125
[cdy]: https://www.codacy.com/app/dgattey/dg?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=dgattey/dg&amp;utm_campaign=Badge_Grade
[cc-img]: https://api.codeclimate.com/v1/badges/333adb209e1ac3086303/maintainability
[cc]: https://codeclimate.com/github/dgattey/dg/maintainability
[fcr-img]: https://www.codefactor.io/repository/github/dgattey/dg/badge
[fcr]: https://www.codefactor.io/repository/github/dgattey/dg
[deep-img]: https://deepscan.io/api/teams/2858/projects/4266/branches/34746/badge/grade.svg
[deep]: https://deepscan.io/dashboard#view=project&tid=2858&pid=4266&bid=34746

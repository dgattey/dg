[![Maintainability](https://api.codeclimate.com/v1/badges/333adb209e1ac3086303/maintainability)](https://codeclimate.com/github/dgattey/dg/maintainability)  [![codebeat badge](https://codebeat.co/badges/7af102f5-2b3e-4068-8678-6ed819c4397d)](https://codebeat.co/projects/github-com-dgattey-dg-master)

# Dylan Gattey
This is a redesign of https://dylangattey.com to a lightweight, mobile-friendly, polished exhibition of my projects/experiments. It's been a slow, unchanging Wordpress site for years. I'm using a static site generator, [Jekyll](https://jekyllrb.com/), to build it. It's hosted on [Netlify](https://netlify.com), backed by [Cloudflare](https://cloudflare.com), with continuous integration based off this repo.

## Initial Setup
### Development Dependencies
You must have the following already installed:
- `HomeBrew`
- `Ruby` & `RubyGems` (`rvm` is a great tool for managing versions)
- `ImageOptim`
- `npm` to install `PurgeCSS`

### Setup script
Once the above are manually installed, you can simply run the `setup` script to install the following:
- `Bundler`
- `ImageMagick` (make sure `webp` appears under delegates, if not and you're on Linux, try [this guide](https://github.com/rosell-dk/webp-convert/wiki/Installing-Imagick-extension))
- `PurgeCSS`

## Local Development
### Workflow
1. Install the necessary gems with `bundle install`
2. Build & serve the site with `bundle exec jekyll serve`
If you want autoreload, use `bundle exec jekyll liveserve`. The site files will live into `build` and be served on `http://localhost:4000/`.

### Adding a new dependency?
Add an entry to the Gemfile, add to `plugins` in `_config.yml` as needed and rerun `bundle install`.

### Changing/adding images?
Use the `process-images` script after doing so. It will optimize/minify all jpg/png files. Additionally, it will convert those files to WebP versions and put them back in the same folders. This allows `jekyll-assets` to properly copy all those files on build. It can take _FOREVER_ to run ImageOptim, so be patient. Also, you may need to run the script multiple times to get the best results.

## DNS, CDN, and Deployment
We're set up with [Cloudflare](https://cloudflare.com) managing DNS & [Netlify](https://netlify.com) as the CDN and CI server that hosts the site. Cloudflare's MX records point to [ZohoMail](https://zoho.com/mail), and points to Netlify as the site source.

### Ready to deploy?
Every commit to `master` branch triggers a new deploy & publish on Netlify :tada:. By default, it uses `JEKYLL_ENV=production bundle exec jekyll build`. If you want a manual deploy, you can log in to Netlify and trigger one.

## Project Status
The project and its status is on Trello at https://trello.com/b/MJdtje7y/dylangattey-com.

### Current integrations
- Google Analytics: setup through Jekyll plugin
- Google Search Console: uploaded a `google*.html` file to the root, plus fallback through the SEO plugin + a value in `_config.yml`
- Adobe Fonts (née Typekit)
- Sitemap: through a plugin, excluding the `google*.html` file via blob in the config
- Autoprefixer: plugin + asset plugin based
- SEO: plugin based
- Assets: plugin based
- PurgeCSS: intalled on Netlify via build task

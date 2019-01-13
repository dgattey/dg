[![Code Climate](https://codeclimate.com/github/dgattey/dg/badges/gpa.svg?style=flat)](https://codeclimate.com/github/dgattey/dg) [![Issue Count](https://codeclimate.com/github/dgattey/dg/badges/issue_count.svg?style=flat)](https://codeclimate.com/github/dgattey/dg)

# Dylan Gattey
This is a redesign of https://dylangattey.com to a lightweight, mobile-friendly, polished exhibition of my projects/experiments. It's been a slow, unchanging Wordpress site for years. Using [Jekyll](https://jekyllrb.com/) to build it, with some smart plugins.

## Dependencies (macOS) & setup
Core dependencies
- `HomeBrew` for Mac
- `Ruby >= 2.5.0` (`rvm` is a great tool for managing versions)
- `RubyGems`
- `ImageOptim`
- `npm` to install `PurgeCSS`

Once the above are installed, you can simply run `./setup` to get the rest imported. It will do the following:
- `Bundler`: install with `setup` script or `gem install bundler`
- `ImageMagick`: install with `setup` script (make sure `webp` appears under delegates) or via brew
- `PurgeCSS`: install with `setup` script or with NPM

## Development
1. Install the necessary gems with `bundle install`
2. Build & serve the site with `bundle exec jekyll serve` (or `bundle exec jekyll liveserve` if you want autoreload). The site files will exist under `build` and be served on `http://localhost:4000/`.

### Adding a new dependency?
Add an entry to the Gemfile, add to `plugins` in `_config.yml` as needed and rerun the above. You generally need to add it to the `plugins` list, but documentation will have the full details.

### Changing/adding images?
Use `./process-images` after doing so. It will optimize/minify all jpg/png files. Additionally, it will convert those files to WebP versions and put them back in the same folders. This allows `jekyll-assets` to properly copy all those files on build, unlike other solutions explored that failed to process all files before build. It can take FOREVER to run ImageOptim, so try again and again until it's finished.

### Deploying to a server?
Use the handy script `./deploy` to do so. It'll optimize all images, execute `jekyll build` to create the necessary files, then (coming eventually) attempt to upload the files to a production server.

## Project Status
Trello board tracking at https://trello.com/b/MJdtje7y/dylangattey-com.

### Current integrations (mostly up to date)
- Google Analytics: plugin-based, with some config in `_config.yml` for the user info
- Google Search Console: uploaded a `google*.html` file to the root, plus fallback through the SEO plugin + a value in `_config.yml`
- Sitemap: through a plugin, excluding the `google*.html` file via blob in the config
- Minification: plugin based, runs on production env or `build --deploy`
- Autoprefixer: plugin + asset plugin based
- SEO: plugin based
- Assets: plugin based
- Cloudflare: set up remotely to proxy DNS

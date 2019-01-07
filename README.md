[![Code Climate](https://codeclimate.com/github/dgattey/dg/badges/gpa.svg?style=flat)](https://codeclimate.com/github/dgattey/dg) [![Issue Count](https://codeclimate.com/github/dgattey/dg/badges/issue_count.svg?style=flat)](https://codeclimate.com/github/dgattey/dg)

# Dylan Gattey
I'm redesigning my site to be a lightweight, mobile-friendly, up to date exhibition of my projects and experiments rather than be the same slow, non-customizable Wordpress grid it's been for years. Currently very much a work in progress, but I'm having fun and teaching myself how to use [Jekyll](https://jekyllrb.com/) in the process! It's meant to be a simpler version of the site with much of the same content, but updated for 2019 instead of 2013 (when I last did anything significant design-wise on my site). Cleaner, sparser layout with larger, clearer font + more professional images, an updated logo, and more of my own voice in the writing.

### Development
Assuming you have Ruby and RubyGems installed, you'll need to install Jekyll & Bundler to start, with `gem install bundler jekyll`. To bundle & run, execute `bundle exec jekyll serve` If you add a new dependency to the Gemfile, rerun that command. Build the site to an output folder with `jekyll build`, or build and serve on `http://localhost:4000/` with `jekyll liveserve`. It'll livereload for you!

To build for server, use `JEKYLL_ENV=production jekyll build` (I think).

### Status
Trello board tracking at https://trello.com/b/MJdtje7y/dylangattey-com.

### Dependencies
- `brew` for Mac
- `ruby`
- `gem`
- `ImageMagick` (test for it with `convert --version` and make sure `webp` appears under delegates)

### Integrations
- Google Analytics: plugin-based, with some config in `_config.yml` for the user info
- Google Search Console: uploaded a `google*.html` file to the root, plus fallback through the SEO plugin + a value in `_config.yml`
- Sitemap: through a plugin, excluding the `google*.html` file via blob in the config
- Minification: plugin based, runs on production env or `build --deploy`
- Autoprefixer: plugin + asset plugin based
- SEO: plugin based
- Assets: plugin based

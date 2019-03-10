# frozen_string_literal: true

# Shared constants that are required cross module
module PurgeCSS
  BUILD_FOLDER = '_site'
  TEMP_FOLDER = '.purgecss'
  # These are the purgecss selectors that are JS added and can't
  # be inferred. We must define them here
  SELECTOR_WHITELIST = [
    'wf-active',
    'wf-inactive',
    'gr_grid_book_container'
  ]
end
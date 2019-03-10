# frozen_string_literal: true

# Jekyll Assets runs async, so on post_write from standard
# Jekyll hooks, we can't be sure that our assets are done writing.
# We want to run purgecss on our CSS files only after they're
# written out entirely. This plugin accomplishes that by hooking
# into JekyllAssets:env:after_init and JekyllAssets:env:after_write
#
# I've written an optimization to make sure we don't re-run purgecss
# on files that are already done. It makes use of temporary files
# that have a hash of the css file contents in it to compute whether
# it needs to get changed or not. It'll run for all CSS files
# independently since you may create multiple when Jekyll Assets
# writes a new version of the file. It prints to console too to
# show what's happening.

require_relative 'constants'
require_relative 'printer'
require_relative 'config'
require_relative 'filesize'
require_relative 'temporarydata'
require_relative 'hasher'
require_relative 'hooks'

module PurgeCSS
  class << PurgeCSS
    BUILT_CSS_GLOB = BUILD_FOLDER + '/**/*.css'
    ASSET_OUTPUT_FOLDER = BUILD_FOLDER + '/assets'

    # Run purgecss and delete the files we didn't already process
    def run
      processed_files = Hash.new(0)
      purge_all_css_files(processed_files: processed_files)
      TemporaryData::clean(processed_files)
    end

    private
      # Runs purgecss on all css files, as needed
      def purge_all_css_files(processed_files:)
        Printer.message('starting purge process')
        Dir.glob(BUILT_CSS_GLOB).each do |css_file|
        purge_file_if_needed(css_file, processed_files: processed_files)
        end
        Printer.message('finished purging')
      end

      # Marks that we're processing this css file and runs purgecss if we should
      # run it on this file given the hashes
      def purge_file_if_needed(css_file, processed_files:)
        temp_file = TemporaryData::generate_filepath css_file
        processed_files[temp_file] = 1
        return if Hasher::have_same_hash?(source_file: css_file, saved_hash_file: temp_file)
        purge_file(css_file: css_file, cached_output_file: temp_file)
      end

      # Prints out file size before/after, runs purgecss on an individual file,
      # and saves the file hash
      def purge_file(css_file:, cached_output_file:)
        Printer.filesize(css_file, 'was originally')
        config_file = Config.write(css_file)
        system("purgecss --config #{config_file} --out #{ASSET_OUTPUT_FOLDER}")
        Printer.filesize(css_file, 'is now')
        Hasher::save_file_hash_of(css_file, to_file: cached_output_file)
      end
  end
end
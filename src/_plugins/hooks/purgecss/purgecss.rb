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
require_relative 'hooks'

module PurgeCSS
  # TODO: @dgattey move these
  ASSET_OUTPUT_FOLDER = BUILD_FOLDER + '/assets'
  BUILT_CSS_GLOB = BUILD_FOLDER + '/**/*.css'
  TEMP_FILE_SUFFIX = '.pcss'
  TEMP_FILE_GLOB = TEMP_FOLDER + '/*' + TEMP_FILE_SUFFIX

  class << PurgeCSS

    # TODO: @dgattey still to clean below here

    def run
      # Save a list of all the hash files we've used
      processed_files = Hash.new(0)

      Printer.message 'starting to purge all files'
      # Loop over all CSS files
      Dir.glob(BUILT_CSS_GLOB).each do |css_file|
        # Get temporary filepath and save that we're processing this one
        temp_filepath = TemporaryData::generate_filepath css_file
        processed_files[temp_filepath] = 1

        # Contents of the CSS file we'll be using, hashed, for comparison
        contents = Digest::SHA512.file css_file

        # Compare the saved contents from last time to the current
        # contents - if they're the same, no purging is needed
        needs_purge = true
        File.open(temp_filepath, 'a+') do |file|
          needs_purge = contents != file.read
        end
        next unless needs_purge

        # Run purge on the file
        run_purgecss css_file

        # Write the hashed contents of the css file now for next time
        purged_contents = Digest::SHA512.file css_file
        File.open(temp_filepath, 'w') do |file|
          file.write(purged_contents)
        end
      end

      Printer.message 'finished processing'

      # There may be extra files laying around for stuff that got deleted
      # so let's delete everything else we didn't process in this run
      Dir.glob(TEMP_FILE_GLOB).each do |file|
        File.delete(file) if (processed_files[file]).zero?
      end
    end

    private
      # Actually runs the system command for purgecss, creating and deleting config
      def run_configured_purgecss(filename)
        config_text = Config.write(filename)
        system("purgecss --config #{Config.filename} --out #{ASSET_OUTPUT_FOLDER}")
        Config.delete
      end

      # Write configuration file for purgecss, run command, and delete it with
      # some status printed out too
      def run_purgecss(filename)
        filesize = FileSize.in_kb filename
        Printer.message("was originally #{filesize}KB", filename, true)
        run_configured_purgecss filename
        filesize = FileSize.in_kb filename
        Printer.message("is now #{filesize}KB", filename, true)
      end
  end
end
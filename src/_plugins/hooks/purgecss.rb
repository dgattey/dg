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

class PurgeCSSPrinter
  # Constants
  SPACER = '          purgecss: '
  MESSAGE_MAX_LENGTH = 50

  class << PurgeCSSPrinter

    # Prints out the plugin's status based on values
    def plugin_status(is_enabled, config_value, jekyll_env)
      print SPACER
      print 'enabled' if is_enabled
      print 'disabled' unless is_enabled
      puts ' (config)' unless config_value.nil?
      puts " (#{jekyll_env} environment)" if config_value.nil?
    end

    # Prints out a status message with leading space and formatting.
    # If a filename is included it'll print out too
    def message(message, filename = '', put_filename_first = false)
      truncated_message = truncated_first(filename, message) if put_filename_first
      truncated_message = truncated_last(message, filename) unless put_filename_first
      puts "#{SPACER}#{truncated_message}"
    end

    private
      # Truncates a string to a limited number of chars (truncatable message is last)
      def truncated_last(message, truncatable_message)
        full_message = "#{message} #{truncatable_message}"
        length = full_message.length
        if length > MESSAGE_MAX_LENGTH
          full_message[0, message.length + 1] + '...' + full_message[length - MESSAGE_MAX_LENGTH + message.length + 4, length - 1]
        else
          full_message
        end
      end

      # Truncates a string to a limited number of chars (truncatable message is first)
      def truncated_first(truncatable_message, message)
        full_message = "#{truncatable_message} #{message}"
        length = full_message.length
        if length > MESSAGE_MAX_LENGTH
          '...' + full_message[length - MESSAGE_MAX_LENGTH + 3, length - 1]
        else
          full_message
        end
      end

  end
end

class PurgeCSS
  # These are the purgecss selectors that are JS added and can't
  # be inferred. We must define them here
  SELECTOR_WHITELIST = [
    'wf-active',
    'wf-inactive',
    'gr_grid_book_container'
  ]

  # Temp constants
  TEMP_FOLDER = '.purgecss'
  TEMP_FILE_SUFFIX = '.pcss'
  TEMP_FILE_GLOB = TEMP_FOLDER + '/*' + TEMP_FILE_SUFFIX
  CONFIG_FILE = TEMP_FOLDER + '/config.js'

  # Build constants
  BUILD_FOLDER = '_site'
  ASSET_OUTPUT_FOLDER = BUILD_FOLDER + '/assets'
  BUILT_HTML_GLOB = BUILD_FOLDER + '/**/*.html'
  BUILT_CSS_GLOB = BUILD_FOLDER + '/**/*.css'

  class Setup
    class << Setup

      # Reads env and config to return plugin status and config value
      def read_plugin_status(site)
        config_value = status_from_config site.config
        env_value = status_from_env
        return is_enabled(config_value, env_value), config_value, jekyll_env
      end

      private
        # Returns the site env variable
        def jekyll_env
          return ENV['JEKYLL_ENV'] || 'development'
        end

        # Reads the site config to figure out whether PurgeCSS is enabled
        def status_from_config(config)
          return config['use_purge_css']
        end

        # Reads the site env variables to figure out whether PurgeCSS is enabled
        def status_from_env
          return jekyll_env == 'production'
        end

        # Figures out whether or not purgecss is enabled based on env/config and
        # sets the variable showing that
        def is_enabled(config_value, env_value)
          return config_value unless config_value.nil?
          return env_value if config_value.nil?
        end

    end
  end

  class TempFileHelper
    class << TempFileHelper

      # Create the temp dir if it doesn't exist
      def create_folder
        FileUtils.mkdir(TEMP_FOLDER) unless Dir.exist?(TEMP_FOLDER)
      end

      # Computes a hashed filepath in the temp folder from a filename
      def generate_filepath(name)
        hashed_name = Digest::MD5.hexdigest name
        TEMP_FOLDER + '/' + hashed_name + TEMP_FILE_SUFFIX
      end

       # Calculates a string filesize in KB for a given file
      def filesize_in_kb(filename)
        format('%.2f', (File.size(filename).to_f / 1000))
      end

    end
  end

  class << PurgeCSS

    # Variables
    @@is_enabled = false

    # All setup for initialization of purgecss
    def setup(site)
      @@is_enabled, config_value, jekyll_env = Setup.read_plugin_status site
      PurgeCSSPrinter.plugin_status(@@is_enabled, config_value, jekyll_env)
      TempFileHelper.create_folder
    end

    # Deletes any temp files from last time
    def clean_stale_files
      Dir.glob(TEMP_FILE_GLOB).each do |file|
        PurgeCSSPrinter.message('deleting stale file', file)
        File.delete file
      end
    end

    # TODO: @dgattey still to clean below here

    def after_write
      return unless @@is_enabled

      # Save a list of all the hash files we've used
      processed_files = Hash.new(0)

      PurgeCSSPrinter.message 'starting to purge all files'
      # Loop over all CSS files
      Dir.glob(BUILT_CSS_GLOB).each do |css_file|
        # Get temporary filepath and save that we're processing this one
        temp_filepath = TempFileHelper.generate_filepath css_file
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

      PurgeCSSPrinter.message 'finished processing'

      # There may be extra files laying around for stuff that got deleted
      # so let's delete everything else we didn't process in this run
      Dir.glob(TEMP_FILE_GLOB).each do |file|
        File.delete(file) if (processed_files[file]).zero?
      end
    end

    private
      # Returns a string for the JS config based on the docs at
      # https://www.purgecss.com/configuration for purgecss configuration
      def purgecss_config_text(filename)
        ''"module.exports = #{{
          content: [BUILT_HTML_GLOB],
          css: [filename],
          whitelist: SELECTOR_WHITELIST
        }.stringify_keys.to_json}"''
      end

      # Actually runs the system command for purgecss, creating and deleting config
      def run_configured_purgecss(filename)
        config_text = purgecss_config_text(filename)
        File.open(CONFIG_FILE, 'w') do |file|
          file.write(config_text)
        end
        system("purgecss --config #{CONFIG_FILE} --out #{ASSET_OUTPUT_FOLDER}")
        File.delete(CONFIG_FILE)
      end

      # Write configuration file for purgecss, run command, and delete it with
      # some status printed out too
      def run_purgecss(filename)
        filesize = TempFileHelper.filesize_in_kb filename
        PurgeCSSPrinter.message("was originally #{filesize}KB", filename, true)
        run_configured_purgecss filename
        filesize = TempFileHelper.filesize_in_kb filename
        PurgeCSSPrinter.message("is now #{filesize}KB", filename, true)
      end

  end
end

# Sets up plugin status and does setup
Jekyll::Hooks.register :site, :after_init do |site|
  PurgeCSS.setup(site)
end

# Cleans up stale files on assets init
Jekyll::Assets::Hook.register :env, :after_init do
  PurgeCSS.clean_stale_files
end

# Runs PurgeCSS if necessary
Jekyll::Assets::Hook.register :env, :after_write do
  PurgeCSS.after_write
end

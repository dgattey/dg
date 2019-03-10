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

  # Formatting constants
  LEADING_SPACE = '                    '

  # Variables
  @@is_enabled = false


  # TODO: @dgattey access control

  class << PurgeCSS

    # Checks and prints out if the plugin is enabled
    def set_plugin_status_globally(site)
      config_value = status_from_config(site.config)
      env_value = status_from_env
      set_plugin_enabled(config_value, env_value)
      print_plugin_status(config_value)
    end

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
    def set_plugin_enabled(config_value, env_value)
      @@is_enabled = config_value unless config_value.nil?
      @@is_enabled = env_value if config_value.nil?
    end

    # Prints out the plugin's status based on values
    def print_plugin_status(config_value)
      print '          purgecss: '
      print 'enabled' if @@is_enabled
      print 'disabled' unless @@is_enabled
      puts ' (config)' unless config_value.nil?
      puts " (#{jekyll_env} environment)" if config_value.nil?
    end

    # Prints a filesize in KB for a given file
    def print_filesize(filename, message)
      filesize = format('%.2f', (File.size(filename).to_f / 1000))
      print LEADING_SPACE
      puts "  [#{filesize}KB] #{message}"
    end

    # Computes a hashed filepath in the temp folder from a filename
    def get_temporary_filepath(name)
      hashed_name = Digest::MD5.hexdigest name
      TEMP_FOLDER + '/' + hashed_name + TEMP_FILE_SUFFIX
    end

    # Actually runs the system command for purgecss
    def run_system_purgecss(filename)
      # JS config (Docs: https://www.purgecss.com/configuration)
      config_text = ''"module.exports = #{{
        content: [BUILT_HTML_GLOB],
        css: [filename],
        whitelist: SELECTOR_WHITELIST
      }.stringify_keys.to_json}"''

      File.open(CONFIG_FILE, 'w') do |file|
        file.write(config_text)
      end
      system("purgecss --config #{CONFIG_FILE} --out #{ASSET_OUTPUT_FOLDER}")
      File.delete(CONFIG_FILE)
    end

    # Runs PurgeCSS on a file
    def purge(filename)
      # Print out which file we're purging in-place
      puts "#{LEADING_SPACE}purging unused css from: "
      puts "#{LEADING_SPACE}  " + filename
      print_filesize(filename, 'before purging')

      # Write configuration file for purgecss, run command, and delete it
      run_system_purgecss filename

      # Show progress
      print_filesize(filename, 'after purging')
    end

    # Create the temp dir if it doesn't exist
    def setup_temp_folder
      FileUtils.mkdir(TEMP_FOLDER) unless Dir.exist?(TEMP_FOLDER)
    end

    # Deletes any temp files from last time
    def delete_stale_temp_files
      Dir.glob(TEMP_FILE_GLOB).each do |file|
        print "#{LEADING_SPACE} deleting stale file "
        puts file
        File.delete(file)
      end
    end

    # TODO: @dgattey fix up
    def after_write
      return unless @@is_enabled

      # Save a list of all the hash files we've used
      processed_files = Hash.new(0)

      # Loop over all CSS files
      Dir.glob(BUILT_CSS_GLOB).each do |css_file|
        # Get temporary filepath and save that we're processing this one
        temp_filepath = get_temporary_filepath css_file
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
        purge css_file

        # Write the hashed contents of the css file now for next time
        purged_contents = Digest::SHA512.file css_file
        File.open(temp_filepath, 'w') do |file|
          file.write(purged_contents)
        end
      end

      # There may be extra files laying around for stuff that got deleted
      # so let's delete everything else we didn't process in this run
      Dir.glob(TEMP_FILE_GLOB).each do |file|
        File.delete(file) if (processed_files[file]).zero?
      end
    end
  end
end

# Reads in config values to set purgecss enabled or not
Jekyll::Hooks.register :site, :after_init do |site|
  PurgeCSS.set_plugin_status_globally(site)
end

# Recreates an empty temp folder & cleans up on init
Jekyll::Assets::Hook.register :env, :after_init do
  PurgeCSS.setup_temp_folder
  PurgeCSS.delete_stale_temp_files
end

# Runs PurgeCSS if necessary
Jekyll::Assets::Hook.register :env, :after_write do
  PurgeCSS.after_write
end

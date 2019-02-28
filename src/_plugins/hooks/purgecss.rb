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

# These are the purgecss selectors that are JS added and can't
# be inferred. We must define them here
def export_whitelist
  @selector_whitelist = [
    'wf-active',
    'wf-inactive'
  ]
end

def export_temp_constants
  @temporary_folder = '.purgecss'
  @hash_suffix = '.pcss'
  @temporary_files = @temporary_folder + '/*' + @hash_suffix
  @config_file = @temporary_folder + '/config.js'
end

def export_build_constants
  @build_folder = '_site'
  @output_folder = @build_folder + '/assets'
  @html_glob = @build_folder + '/**/*.html'
  @css_glob = @build_folder + '/**/*.css'
end

# Simply exposes the constants because they can't be truly global
def export_constants
  @should_run = true
  export_temp_constants
  export_build_constants
  export_whitelist
  @leading_space = '                    '
end

# Prints a filesize in KB for a given file
def print_filesize(filename, message)
  filesize = format('%.2f', (File.size(filename).to_f / 1000))
  print @leading_space
  puts "  [#{filesize}KB] #{message}"
end

# Computes a hashed filepath in the temp folder from a filename
def get_temporary_filepath(name)
  hashed_name = Digest::MD5.hexdigest name
  @temporary_folder + '/' + hashed_name + @hash_suffix
end

# Actually runs the system command for purgecss
def run_system_purgecss(filename)
  # JS config (Docs: https://www.purgecss.com/configuration)
  config_text = ''"module.exports = #{{
    content: [@html_glob],
    css: [filename],
    whitelist: @selector_whitelist
  }.stringify_keys.to_json}"''

  File.open(@config_file, 'w') do |file|
    file.write(config_text)
  end
  system("purgecss --config #{@config_file} --out #{@output_folder}")
  File.delete(@config_file)
end

# Runs PurgeCSS on a file
def purge(filename)
  # Print out which file we're purging in-place
  puts "#{@leading_space}purging unused css from: "
  puts "#{@leading_space}  " + filename
  print_filesize(filename, 'before purging')

  # Write configuration file for purgecss, run command, and delete it
  run_system_purgecss filename

  # Show progress
  print_filesize(filename, 'after purging')
end

# Recreates an empty temp folder on init
Jekyll::Assets::Hook.register :env, :after_init do
  export_constants

  # Create the temp dir if it doesn't exist
  FileUtils.mkdir(@temporary_folder) unless Dir.exist?(@temporary_folder)

  # Delete any files from last time
  Dir.glob(@temporary_files).each do |file|
    print @leading_space
    print 'deleting stale file '
    puts file
    File.delete(file)
  end
end

# Runs PurgeCSS if necessary
Jekyll::Assets::Hook.register :env, :after_write do
  export_constants
  if !@should_run
    next
  end

  # Save a list of all the hash files we've used
  processed_files = Hash.new(0)

  # Loop over all CSS files
  Dir.glob(@css_glob).each do |css_file|
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
  Dir.glob(@temporary_files).each do |file|
    File.delete(file) if (processed_files[file]).zero?
  end
end

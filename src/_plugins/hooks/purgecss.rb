# frozen_string_literal: true

@config_file = '.tmp/purgecss.js'
@build_directory = 'build'
@temp_directory = '.tmp'

Jekyll::Hooks.register(:site, :post_write) do |_site|
  # Only run on production
  if Jekyll.env == 'production'
    # Create temp directory if it's missing
    FileUtils.mkdir(@temp_directory) unless Dir.exist?(@temp_directory)

    # Make sure we delete the config file
    File.delete(@config_file) if File.exist?(@config_file)

    # Configuration JS to write to the file. (Docs: https://www.purgecss.com/configuration)
    config_text = ''"module.exports = #{{
      content: [@build_directory + '/**/*.html'],
      css: [Dir.glob(@build_directory + '/assets/*.css').first],
      whitelist: %w[overhang-parent card-pull-right round-corners
                    shadow-weak wf-active wf-inactive]
    }.stringify_keys.to_json}"''

    # Write configuration file & run command
    File.open(@config_file, 'w+') { |f| f.write(config_text) }
    system("purgecss --config #{@config_file} --out #{@build_directory}/assets")
  end
end

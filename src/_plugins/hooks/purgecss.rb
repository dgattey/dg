# Assumes site is under `build`
Jekyll::Hooks.register(:site, :post_write) do |_site|
	config_file = '.tmp/purgecss.js'
	# Make sure we delete the config file
	FileUtils.mkdir('.tmp') unless Dir.exist?('.tmp')
	File.delete(config_file) if File.exist?(config_file)
	# Configuration JS to write to the file. (Docs: https://www.purgecss.com/configuration)
	config_text = """module.exports = #{{
	# Wildcard glob of the site's HTML files.
	content: ['build/**/*.html'],
	# CSS file in the expected output directory.
	css: [Dir.glob('build/assets/*.css').first],
	whitelist: %w(shadow-weak)
	}.stringify_keys.to_json}"""
	# Write configuration file & run command
	File.open(config_file, 'w+') { |f| f.write(config_text) }
	system("purgecss --config #{config_file} --out build/assets")
end
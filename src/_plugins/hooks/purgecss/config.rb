# frozen_string_literal: true

module PurgeCSS
  # Logic related to the config of both the plugin itself and the node module
  # config
  class Config
    class << Config
      CONFIG_FILE = PURGE_FOLDER + '/config.js'
      BUILT_HTML_GLOB = BUILD_FOLDER + '/**/*.html'

      # Reads env and config to return plugin status and config value
      def plugin_status(site)
        config_value = site.config['use_purge_css'] || ''
        jekyll_env = ENV['JEKYLL_ENV'] || 'development'
        env_value = jekyll_env == 'production'
        [enabled?(config_value, env_value), config_value, jekyll_env]
      end

      # Writes the purgecss config to file
      def write(filename)
        config_text = purgecss_config_text(filename)
        File.open(CONFIG_FILE, 'w') do |file|
          file.write(config_text)
        end
        CONFIG_FILE
      end

      # Deletes the config file
      def clean
        File.delete(CONFIG_FILE) if File.exist?(CONFIG_FILE)
      end

      private

      # Figures out whether or not purgecss is enabled based on env/config and
      # sets the variable showing that
      def enabled?(config_value, env_value)
        empty_config = config_value.empty?
        return config_value unless empty_config
        return env_value if empty_config
      end

      # Returns a string for the JS config based on the docs at
      # https://www.purgecss.com/configuration for purgecss configuration
      def purgecss_config_text(filename)
        ''"module.exports = #{{
          content: [BUILT_HTML_GLOB],
          css: [filename],
          whitelist: SELECTOR_WHITELIST
        }.stringify_keys.to_json}"''
      end
    end
  end
end

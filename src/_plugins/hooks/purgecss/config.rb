# frozen_string_literal: true

require_relative 'constants'

module PurgeCSS
  # Logic related to the config of both the plugin itself and the node module
  # config
  class Config
    class << Config
      CONFIG_FILE = PURGE_FOLDER + '/config.js'
      BUILT_HTML_GLOB = BUILD_FOLDER + '/**/*.html'

      # Reads env and config to return plugin status and config value
      def plugin_status(site)
        config_value = site.config['use_purge_css'].to_s
        jekyll_env = ENV['JEKYLL_ENV'] || 'development'
        enabled?(config_value, jekyll_env)
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
      # sets the variable showing that and which it was
      def enabled?(config_value, env_value)
        unset_config = config_value.empty?
        if unset_config
          status = "#{env_value} environment"
          [env_value == 'production', status]
        else
          [config_value == 'true', 'config']
        end
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

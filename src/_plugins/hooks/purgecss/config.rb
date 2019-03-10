# frozen_string_literal: true

module PurgeCSS
  # Logic related to the config of both the plugin itself and the node module config
  class Config
    class << Config
      CONFIG_FILE = TEMP_FOLDER + '/config.js'
      BUILT_HTML_GLOB = BUILD_FOLDER + '/**/*.html'

      # Reads env and config to return plugin status and config value
      def plugin_status(site)
        config_value = site.config['use_purge_css']
        jekyll_env = ENV['JEKYLL_ENV'] || 'development'
        env_value = jekyll_env == 'production'
        return is_enabled(config_value, env_value), config_value, jekyll_env
      end

      # TODO: @dgattey try to remove this
      # Returns the filename for the config file
      def filename
        CONFIG_FILE
      end

      # Writes the purgecss config to file
      def write(filename)
        config_text = purgecss_config_text(filename)
        File.open(CONFIG_FILE, 'w') do |file|
          file.write(config_text)
        end
      end  

      # Deletes the config file
      def delete
        File.delete(CONFIG_FILE)
      end

      private
        # Figures out whether or not purgecss is enabled based on env/config and
        # sets the variable showing that
        def is_enabled(config_value, env_value)
          return config_value unless config_value.nil?
          return env_value if config_value.nil?
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
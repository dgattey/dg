# frozen_string_literal: true

module PurgeCSS
  # Coordinates with the hooks below
  class Coordinator
    class << Coordinator
      # All setup for initialization of purgecss - sets plugin enabled value,
      # prints status, and creates the temporary folder, or cleans up if not
      # enabled
      def setup(site)
        @plugin_enabled, config_value, jekyll_env = Config.plugin_status site
        if plugin_enabled
          setup_when_enabled(config_value, jekyll_env)
        else
          setup_when_disabled(config_value, jekyll_env)
        end
        Config.clean
      end

      # Runs purge on the css files if enabled
      def purge
        PurgeCSS.run if plugin_enabled
      end

      private

      # Whether the plugin is globally enabled
      def plugin_enabled
        @plugin_enabled ||= false
      end

      # Does setup when the plugin's enabled
      def setup_when_enabled(config_value, jekyll_env)
        Printer.plugin_status('enabled', config_value, jekyll_env)
        TemporaryData.create_folder
        TemporaryData.clean
      end

      # Does setup when the plugin's disabled
      def setup_when_disabled(config_value, jekyll_env)
        Printer.plugin_status('disabled', config_value, jekyll_env)
        TemporaryData.delete_folder
      end
    end
  end
end

# Sets up the coordinator and cleans up
Jekyll::Hooks.register :site, :after_init do |site|
  PurgeCSS::Coordinator.setup(site)
end

# Runs PurgeCSS if necessary
Jekyll::Assets::Hook.register :env, :after_write do
  PurgeCSS::Coordinator.purge
end

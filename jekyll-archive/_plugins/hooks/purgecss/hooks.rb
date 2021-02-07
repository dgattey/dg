# frozen_string_literal: true

module PurgeCSS
  # Coordinates with the hooks below
  class Coordinator
    class << Coordinator
      # All setup for initialization of purgecss - sets plugin enabled value,
      # prints status, and creates the temporary folder, or cleans up if not
      # enabled
      def setup(site)
        @plugin_enabled, message = Config.plugin_status site
        if plugin_enabled
          setup_when_enabled(message)
        else
          setup_when_disabled(message)
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
      def setup_when_enabled(message)
        Printer.plugin_status('enabled', message)
        TemporaryData.create_folder
        TemporaryData.clean
      end

      # Does setup when the plugin's disabled
      def setup_when_disabled(message)
        Printer.plugin_status('disabled', message)
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

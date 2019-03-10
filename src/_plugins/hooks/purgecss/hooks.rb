# frozen_string_literal: true

module PurgeCSS
  # Coordinates with the hooks below
  class Coordinator
    class << Coordinator
      @@is_enabled = false

      # All setup for initialization of purgecss - sets plugin enabled value,
      # prints status, and creates the temporary folder
      def setup(site)
        @@is_enabled, config_value, jekyll_env = Config::plugin_status site
        Printer.plugin_status(@@is_enabled, config_value, jekyll_env)
        TemporaryData::create_folder if @@is_enabled
      end

      # Cleans temporary data if enabled
      def sweep
        TemporaryData::clean if @@is_enabled
      end

      # Runs purge on the css files if enabled
      def purge
        PurgeCSS.run if @@is_enabled
      end
    end
  end
end

# Sets up plugin status and does setup
Jekyll::Hooks.register :site, :after_init do |site|
  PurgeCSS::Coordinator.setup(site)
end

# Cleans up stale files on assets init
Jekyll::Assets::Hook.register :env, :after_init do
  PurgeCSS::Coordinator.sweep
end

# Runs PurgeCSS if necessary
Jekyll::Assets::Hook.register :env, :after_write do
  PurgeCSS::Coordinator.purge
end

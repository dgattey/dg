# frozen_string_literal: true

module PurgeCSS
  # Contains logic to print messages for all other modules/classes
  class Printer
    class << Printer
      SPACER = '          purgecss: '
      MESSAGE_MAX_LENGTH = 50

      # Prints out the plugin's status based on values
      def plugin_status(is_enabled, config_value, jekyll_env)
        print SPACER
        print 'enabled' if is_enabled
        print 'disabled' unless is_enabled
        puts ' (config)' unless config_value.nil?
        puts " (#{jekyll_env} environment)" if config_value.nil?
      end

      # Prints a filesize in kb with a prepended message
      def filesize(filename, message)
        filesize = FileSize.in_kb filename
        Printer.message("#{message} #{filesize}KB", filename, true)
      end

      # Prints out a status message with leading space and formatting.
      # If a filename is included it'll print out too
      def message(message, filename = '', put_filename_first = false)
        truncated_message = truncated_first(filename, message) if put_filename_first
        truncated_message = truncated_last(message, filename) unless put_filename_first
        puts "#{SPACER}#{truncated_message}"
      end

      private
        # Truncates a string to a limited number of chars (truncatable message is last)
        def truncated_last(message, truncatable_message)
          full_message = "#{message} #{truncatable_message}"
          length = full_message.length
          if length > MESSAGE_MAX_LENGTH
            full_message[0, message.length + 1] + '...' + full_message[length - MESSAGE_MAX_LENGTH + message.length + 4, length - 1]
          else
            full_message
          end
        end

        # Truncates a string to a limited number of chars (truncatable message is first)
        def truncated_first(truncatable_message, message)
          full_message = "#{truncatable_message} #{message}"
          length = full_message.length
          if length > MESSAGE_MAX_LENGTH
            '...' + full_message[length - MESSAGE_MAX_LENGTH + 3, length - 1]
          else
            full_message
          end
        end
      end
  end
end

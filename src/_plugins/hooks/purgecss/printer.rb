# frozen_string_literal: true

require_relative 'constants'

module PurgeCSS
  # Contains logic to print messages for all other modules/classes
  class Printer
    class << Printer
      SPACER = '          purgecss: '
      MESSAGE_MAX_LENGTH = 50

      # Prints out the plugin's status based on values
      def plugin_status(enabled_string, message)
        puts "#{SPACER}#{enabled_string} (#{message})"
      end

      # Prints a filesize in kb with a prepended message
      def filesize(filename, prepended_message)
        filesize = FileSize.in_kb filename
        message = "#{prepended_message} #{filesize}KB"
        Printer.message_filename_first(message, filename)
      end

      # Prints out a status message with leading space and formatting.
      # If a filename is included it'll print out too
      def message(appended_message, filename = '')
        message = truncated_last(appended_message, filename)
        puts "#{SPACER}#{message}"
      end

      # Prints out a status message with leading space and formatting.
      # If a filename is included it'll print out too
      def message_filename_first(prepended_message, filename = '')
        message = truncated_first(filename, prepended_message)
        puts "#{SPACER}#{message}"
      end

      private

      # Truncates a string to a limited number of chars (truncatable message
      # is last)
      def truncated_last(message, truncatable_message)
        full_message = "#{message} #{truncatable_message}"
        length = full_message.length
        if length > MESSAGE_MAX_LENGTH
          calc_truncated_last(full_message, message, length)
        else
          full_message
        end
      end

      # Calculates the string for truncated last
      def calc_truncated_last(full_message, message, length)
        msg_len = message.length
        first_part = full_message[0, msg_len + 1]
        second_start = length - MESSAGE_MAX_LENGTH + msg_len + 4
        first_part + '...' + full_message[second_start, length - 1]
      end

      # Truncates a string to a limited number of chars (truncatable message
      # is first)
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

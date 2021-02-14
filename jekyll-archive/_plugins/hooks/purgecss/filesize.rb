# frozen_string_literal: true

module PurgeCSS
  # Contains logic for filesize computation
  class FileSize
    class << FileSize
      # Calculates a string filesize in KB for a given file
      def in_kb(filename)
        format('%.2f', (File.size(filename).to_f / 1000))
      end
    end
  end
end

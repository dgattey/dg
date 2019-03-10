# frozen_string_literal: true

module PurgeCSS
  # Contains logic for temporary data wrangling
  class TemporaryData
    class << TemporaryData
      TEMP_FILE_SUFFIX = '.pcss'

      # Deletes any temp files from last time unless they're in the safe_files hash
      def clean(safe_files = Hash.new(0))
        Dir.glob(TEMP_FOLDER + '/*' + TEMP_FILE_SUFFIX).each do |file|
          next unless (safe_files[file]).zero?
          Printer.message('deleting stale file', file)
          File.delete(file)
        end
      end

      # Create the temp dir if it doesn't exist
      def create_folder
        return if Dir.exist?(TEMP_FOLDER)
        Printer.message('creating temporary folder', TEMP_FOLDER)
        FileUtils.mkdir(TEMP_FOLDER)
      end

      # Deletes the temp dir if it exists
      def delete_folder
        return unless Dir.exist?(TEMP_FOLDER)
        Printer.message('deleting temporary folder', TEMP_FOLDER)
        FileUtils.remove_dir(TEMP_FOLDER)
      end

      # Computes a hashed filepath in the temp folder from a filename
      def generate_filepath(name)
        hashed_name = Digest::MD5.hexdigest name
        TEMP_FOLDER + '/' + hashed_name + TEMP_FILE_SUFFIX
      end
    end
  end
end
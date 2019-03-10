# frozen_string_literal: true

module PurgeCSS
  # Contains logic for temporary data wrangling
  class TemporaryData
    class << TemporaryData    
      # Deletes any temp files from last time
      def clean
        Dir.glob(TEMP_FILE_GLOB).each do |file|
          Printer.message('deleting stale file', file)
          File.delete file
        end
      end

      # Create the temp dir if it doesn't exist
      def create_folder
        FileUtils.mkdir(TEMP_FOLDER) unless Dir.exist?(TEMP_FOLDER)
      end

      # Computes a hashed filepath in the temp folder from a filename
      def generate_filepath(name)
        hashed_name = Digest::MD5.hexdigest name
        TEMP_FOLDER + '/' + hashed_name + TEMP_FILE_SUFFIX
      end
    end
  end
end
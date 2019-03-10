# frozen_string_literal: true

module PurgeCSS
  # Contains logic for file hashing
  class Hasher
    class << Hasher
      # Hashes the contents of a source file to another file
      def save_file_hash_of(source_file, to_file:)
        hashed_contents = contents_of(file: source_file)
        File.open(to_file, 'w') do |file|
          file.write(hashed_contents)
        end
      end

      # Compare a saved hash from the cached file to the current hash of a file
      # and return if they're equal
      def same_hash?(src_file:, saved_hash_file:)
        hashed_contents = contents_of(file: src_file)
        same_hash = false
        File.open(saved_hash_file, 'a+') do |file|
          same_hash = hashed_contents == file.read
        end
        same_hash
      end

      private

      # Consistently hashes the contents of a file and returns it
      def contents_of(file:)
        Digest::SHA512.file file
      end
    end
  end
end

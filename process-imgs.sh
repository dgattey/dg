#! /bin/bash
set -e

# Echo an error message before exiting
err_report() {
    echo "$(tput setaf 1)optimize: error on line $1$(tput sgr0)"
}
trap 'err_report $LINENO' ERR

# --------------------------
# CONSTANTS
# --------------------------
IMAGE_OPTIM=/Applications/ImageOptim.app/Contents/MacOS/ImageOptim
OPTIM_OUTPUT_FILE=".tmp/optimoutput"
ERASE="\r\033[K"

IMAGE_ASSET_PATH=./src/_assets/img
IMAGE_FILETYPES=("jpg" "png")
ICON_ASSET_PATH=./src/_assets/icons
ICON_FILETYPES=("png" "svg")
CONVERSION_FILETYPE="webp"

# --------------------------
# PRINT FUNCTIONS
# --------------------------

# Echos a simple status message, linebreaking the previous content
print_status_message() {
	local message=$1

	echo -e "\n$(tput setaf 6)${message}$(tput sgr0)"
}

# Prints a success message with a green checkmark
print_success_message() {
	local message=$1

	echo -en "$ERASE"
	echo -en "$(tput setaf 2)√$(tput sgr0)\t"
	echo -en "$message"
}

# Prints a tool icon "working" message with iteration count
print_iteration_working_message() {
	local filename=$1
	local iteration_count=$2

	echo -en "$ERASE"
	echo -en $'\xF0\x9f\x9b\xa0' # Tool icon
	echo -en "\tWorking on ${filename}"
	print_iteration "$iteration_count" "pass"
}

# Prints a "(pass 3)" type of string in yellow with given message content
print_iteration() {
	local iteration_count=$1
	local prepend_string=$2
	local append_string=$3

	echo -en " $(tput setaf 3)"
	echo -en "(${prepend_string} ${iteration_count}${append_string})"
	echo -en "$(tput sgr0)"
}

# Prints either already optimized or now optimized with pass count,
# given the iteration number
print_end_iteration_result() {
	local filename=$1
	local iteration_count=$2

	print_success_message "$filename"
	if [ "$iteration_count" -lt 2 ]; then
		echo " already optimized"
	else
		echo -n " now optimized"
    	print_iteration "$iteration_count" "took" " passes"
    	echo -en "\n"
    fi
}

# --------------------------
# CONVERT
# --------------------------

# Converts the files in the directory that match an extension to an extension
convert_files() {
	local filetype=$1
	local directory=$2
	local output_filetype=$3

	for file in "${directory}"/*."${filetype}"; do
		local filename
        filename=$(basename "$file" ."$1")
		local output_file="${directory}/${filename}.${output_filetype}"

		convert "${file}" "${output_file}"
		print_success_message "Created ${filename}.${output_filetype}\n"
	done
}

# Converts all filetypes in a given directory to a filetype
convert_filetypes_until_done() {
	local directory=$1
	local output_filetype=$2
	shift
	shift

    # Rest of arguments are all the filetypes
	for filetype in "$@"
	do
		print_status_message "Beginning conversion of ${filetype}s"
	    convert_files "$filetype" "$directory" "$output_filetype"
	done
}

# --------------------------
# OPTIMIZE
# --------------------------

# Optimizes one image
optimize_image() {
	local file="$1"

	$IMAGE_OPTIM "$file" 2>"$OPTIM_OUTPUT_FILE"
}

# Optimizes a given image until done
optimize_until_done() {
	local file="$1"
	local iteration_count=1
	local filename
    filename=$(basename "$file")

	# First optimize check
	print_iteration_working_message "$filename" "$iteration_count"
	optimize_image "$file"

	# Optimize until there's output from the command (it means there's content)
	while [ "$(head -c1 "$OPTIM_OUTPUT_FILE" | wc -c)" -eq 0 ]; do
    	((iteration_count+=1))

    	# Make sure there's not something wrong and we've reached a ton of iterations
    	if [ "$iteration_count" -gt 9 ]; then
    		echo -en "$ERASE"
    		echo -en "$(tput setaf 1)"
    		echo -en $'\xE2\x98\xA0' # Skull and crossbones
    		echo -en "\tCouldn't optimize ${filename}"
    		print_iteration "$iteration_count" "tried" " times"
    		echo -en "\n"
    		return
    	fi

    	# Replace the content of the line to mark that it's actually optimizing
    	print_iteration_working_message "$filename" "$iteration_count"
    	optimize_image "$file"
    done

    # Overwrite last message to show that we're done
    print_end_iteration_result "$filename" "$iteration_count"
}

# Optimizes a given filetype in a folder until done
optimize_directory_until_done() {
	local filetype="$1"
	local directory="$2"

	for file in "${directory}"/*."${filetype}"; do
		optimize_until_done "$file"
	done
}

# Optimizes given filetypes until done
optimize_filetypes_until_done() {
	local directory="${1}"
	shift

    # Rest of arguments are filetypes
	for filetype in "$@"
	do
	    print_status_message "Optimizing all $filetype images"
		optimize_directory_until_done "$filetype" "$directory"
	done
}

# --------------------------
# MAIN
# --------------------------

# Executes some image minification scripts on images and icons
optimize_filetypes_until_done $IMAGE_ASSET_PATH "${IMAGE_FILETYPES[@]}"
optimize_filetypes_until_done $ICON_ASSET_PATH "${ICON_FILETYPES[@]}"

# Convert all non-icons to WebP
convert_filetypes_until_done $IMAGE_ASSET_PATH $CONVERSION_FILETYPE "${IMAGE_FILETYPES[@]}"
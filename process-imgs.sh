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

    echo ""
    echo -e "$(tput setaf 6)${message}$(tput sgr0)"
}

# Prints a success message with a green checkmark
print_success_message() {
    local message=$1

    echo -en "$ERASE"
    echo -en "$message "
    echo -e "$(tput setaf 2)√$(tput sgr0)"
}

# Prints a "working" message with iteration count
print_working_message() {
    local spin='-\|/'

    local filename=$1
    local iteration_count=$2
    local overall_spin_iteration=$3
    local mode=$4
    local spin_iteration=$((overall_spin_iteration%4))

    local message
    if [ "$overall_spin_iteration" -lt 10 ] && [ "$mode" = "optimize" ]; then
        message="being verified"
    elif [ "$mode" = "optimize" ]; then
        message="being optimized - pass $iteration_count"
    elif [ "$mode" = "convert" ]; then
        message="being converted"
    fi

    echo -en "$ERASE"
    echo -en "$filename "
    print_progress "$message"
    printf " %s" "${spin:$spin_iteration:1}"
}

# Prints a "(pass 3)" type of string in yellow with given message content
print_progress() {
    local message=$1
    echo -en "$(tput setaf 3)$message$(tput sgr0)"
}

# Prints either already optimized or now optimized with pass count,
# given the iteration number
print_end_iteration_result() {
    local filename=$1
    local iteration_count=$2

    if [ "$iteration_count" -lt 2 ]; then
        print_success_message "$filename already optimized"
    else
        local iteration_message
        local passes_message

        # Subtract one since 1x is just verifying it worked
        iteration_count=$((iteration_count-1))
        if [ "$iteration_count" -eq 1 ]; then
            passes_message="pass"
        else
            passes_message="passes"
        fi
        iteration_message=$(print_progress "(finished in $iteration_count $passes_message)")
        print_success_message "$filename now optimized $iteration_message"
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
        local output_file="$directory/$filename.$output_filetype"

        convert "$file" "$output_file" &
        local convertPID=$!

        # Prints a message that moves so we show progress
        local spin_iteration=0
        while kill -0 $convertPID 2>/dev/null
        do
          spin_iteration=$((spin_iteration+1))
          print_working_message "$filename" "$iteration_count" "$spin_iteration" "convert"
          sleep .15
        done

        print_success_message "$filename.$output_filetype created"
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
    local filename="$2"
    local iteration_count="$3"

    $IMAGE_OPTIM "$file" 2>"$OPTIM_OUTPUT_FILE" &
    local optimizePID=$!

    # Prints a message that moves so we show progress
    local spin_iteration=0
    while kill -0 $optimizePID 2>/dev/null
    do
      spin_iteration=$((spin_iteration+1))
      print_working_message "$filename" "$iteration_count" "$spin_iteration" "optimize"
      sleep .15
    done
}

# Optimizes a given image until done
optimize_until_done() {
    local file="$1"
    local iteration_count=1
    local filename
    filename=$(basename "$file")

    # First optimize check
    optimize_image "$file" "$filename" "$iteration_count"

    # Optimize until the command outputs "it has been optimized before"
    while [ "$(grep "it has been optimized before" "$OPTIM_OUTPUT_FILE" | wc -c)" -eq 0 ]; do
        ((iteration_count+=1))

        # Make sure there's not something wrong and we've reached a ton of iterations
        if [ "$iteration_count" -gt 9 ]; then
            echo -en "$ERASE"
            echo -en "$(tput setaf 1)"
            echo -en "Couldn't optimize ${filename}  "
            echo -en $'\xE2\x98\xA0' # Skull and crossbones
            print_progress "tried $iteration_count passes"
            echo ""
            return
        fi

        # Replace the content of the line to mark that it's actually optimizing
        optimize_image "$file" "$filename" "$iteration_count"
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

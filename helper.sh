#! /bin/bash
# shellcheck disable=SC2034
set -e

# Echo an error message before exiting
err_report() {
    echo "$(tput setaf 1)optimize: error on line $1$(tput sgr0)"
}
trap 'err_report $LINENO' ERR

# --------------------------
# CONSTANTS
# --------------------------
ERASE="\\r\\033[K"
TEMP=".tmp"
SETUP_OUTPUT_FILE="$TEMP/setup_output"
OPTIM_OUTPUT_FILE="$TEMP/optim_output"
TESTING_COMMAND_OUTPUT_FILE="$TEMP/testing_command_output"
IMAGE_OPTIM_PATH=/Applications/ImageOptim.app/Contents/MacOS/ImageOptim

# --------------------------
# PRINT FUNCTIONS
# --------------------------

erase_line() {
    echo -en "$ERASE"
}

# Echos a simple status message
print_status_message() {
    local message=$1

    echo -e "$(tput setaf 6)$message$(tput sgr0)"
}

# Prints a success message with a green checkmark
print_success_message() {
    local message=$1

    erase_line
    echo -en "$message"
    echo -e "$(tput setaf 2)√$(tput sgr0)"
}

# Prints a "working" message with iteration count
print_working_message() {
    local spin='-\|/'

    local overall_spin_iteration=$1
    local message=$2
    local verification_message=$3

    local spin_iteration=$((overall_spin_iteration%4))

    # Special case the first few iterations to show a verification message as needed
    if [ "$overall_spin_iteration" -lt 6 ] && [ "$verification_message" != "" ]; then
        message="$verification_message"
    fi

    erase_line
    print_information_message "$message"
    printf "%s" "${spin:$spin_iteration:1}"
}

# Prints a "(pass 3)" type of string in yellow with given message content
print_information_message() {
    local message=$1
    echo -en "$(tput setaf 3)$message$(tput sgr0)"
}

# Prints an error message with a skull and crossbones to show that
# something was impossible, with an optional progress message
print_error_message() {
    local message=$1
    local progress_message=$2

    erase_line
    echo -en "$(tput setaf 1)"
    echo -en "$message  "
    echo -en $'\xE2\x98\xA0' # Skull and crossbones
    print_information_message "$progress_message"
    echo ""
}

# Prints a spinning progress indicator until the last command before this
# is finished. It uses the message passed in to print a status message
print_progress_indicator() {
    local message=$1
    local verification_message=$2

    local pid=$!

    # Prints a message that moves so we show progress
    local spin_iteration=0
    while kill -0 $pid 2>/dev/null
    do
      spin_iteration=$((spin_iteration+1))
      print_working_message "$spin_iteration" "$message" "$verification_message"
      sleep .15
    done
}

# --------------------------
# OTHER FUNCTIONS
# --------------------------

# Installs a given named dependency if needed
install_if_needed() {
    local name=$1
    local check_command=$2
    local is_installed_check_result=$3
    local install_command=$4

    eval "$check_command > $SETUP_OUTPUT_FILE 2>/dev/null" &
    print_progress_indicator "$name: checking for installation "

    # Check to see if item is installed
    if [ "$(grep "$is_installed_check_result" "$SETUP_OUTPUT_FILE" | wc -c)" -ne 0 ]; then
        print_success_message "$name already installed "
        return
    fi

    # We can assume we need to install it - let's show progress
    erase_line
    print_information_message "$name: installing... "
    echo ""
    eval "$install_command"
    print_success_message "$name now installed "
}

# --------------------------
# MAIN
# --------------------------

# Simply creates the temp directory
mkdir -p $TEMP
touch $SETUP_OUTPUT_FILE
touch $OPTIM_OUTPUT_FILE

#! /bin/bash
source ./helper.sh

# --------------------------
# CONSTANTS
# --------------------------
OUTPUT_FILE=".tmp/installoutput"

# --------------------------
# FUNCTIONS
# --------------------------

# Installs a given named dependency if needed
install_if_needed() {
    local name=$1
    local check_command=$2
    local is_installed_check_result=$3
    local install_command=$4

    eval "$check_command > $OUTPUT_FILE 2>/dev/null" &
    print_progress_indicator "$name: checking for installation "

    # Check to see if item is installed
    if [ "$(grep "$is_installed_check_result" "$OUTPUT_FILE" | wc -c)" -ne 0 ]; then
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

# Installs dependencies
print_status_message "Installing all dependencies"

install_if_needed "Bundler" \
    "gem list -i '^bundler'" \
    "true" \
    "gem install bundler -v '< 2.0'"

install_if_needed "ImageMagick 7" \
    "convert --version" \
    "Version: ImageMagick 7" \
    "brew install imagemagick"

install_if_needed "purgecss" \
    "npm -g --parseable list purgecss" \
    "node_modules/purgecss" \
    "npm install -g purgecss"

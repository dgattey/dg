#! /bin/bash
set -e

# Installs a given named dependency if needed
install_if_needed() {
    local name="$1"
    local check_command="$2"
    local install_command="$3"

    if eval "$check_command"; then
        echo "${name} already installed; skipping"
    else
        eval "$install_command"
    fi
}

# Installs dependencies
echo "$(tput setaf 6)Installing dependencies...$(tput sgr0)"

install_if_needed "Bundler" \
    "gem list -i '^bundler' > /dev/null" \
    "gem install bundler -v '< 2.0'"

install_if_needed "ImageMagick" \
    "convert --version > /dev/null" \
    "brew install imagemagick"

install_if_needed "purgecss" \
    "npm -g --parseable list purgecss > /dev/null" \
    "npm install -g purgecss"

echo "$(tput setaf 2)Done setting up!$(tput sgr0)"


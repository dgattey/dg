#! /bin/bash
source ./helper.sh

# --------------------------
# MAIN
# --------------------------

# Installs dependencies
print_status_message "Installing all dependencies"

install_if_needed "Bundler" \
    "gem list -i '^bundler'" \
    "true" \
    "gem install bundler -v '< 2.0'"

install_if_needed "ImageOptim" \
    "ls $IMAGE_OPTIM_PATH" \
    "$IMAGE_OPTIM_PATH" \
    "brew cask install imageoptim"

install_if_needed "ImageMagick 7" \
    "convert --version" \
    "Version: ImageMagick 7" \
    "brew install imagemagick"

install_if_needed "purgecss" \
    "npm -g --parseable list purgecss" \
    "node_modules/purgecss" \
    "npm install -g purgecss"

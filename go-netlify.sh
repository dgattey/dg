#! /bin/bash
source ./helper.sh

# --------------------------
# CONSTANTS
# --------------------------
PRODUCTION="production"
DEPLOY_PREVIEW="deploy-preview"

# --------------------------
# MAIN
# --------------------------
mode="$1"
if [[ -z "$mode" ]]; then
    echo "Needs to be passed a mode"
    exit 1
fi

echo "Doing text substitution..."

# Substitutes placeholders in the netlify.toml for all environments
sed -i '' "s+ADDITIONAL_CSP_PLACEHOLDER+${ADDITIONAL_CSP_SITES}+g" netlify.toml
if [[ "$mode" == "$PRODUCTION" ]]; then
    # Make BASE_URI the contents of URL
    sed -i '' "s+BASE_URI+${URL}+g" netlify.toml
elif [[ "$mode" == "$DEPLOY_PREVIEW" ]]; then
    # Make BASE_URI and main site URL the contents of DEPLOY_PRIME_URL
    sed -i '' "s+BASE_URI+${DEPLOY_PRIME_URL}+g" netlify.toml
    sed -i '' "s+https://dylangattey.com+${DEPLOY_PRIME_URL}+g" _config.yml
fi

echo "Installing purgecss..."
npm i -g purgecss

echo "Fetching tags..."
git fetch "https://dgattey:${GITHUB_ACCESS_TOKEN}@github.com/dgattey/dg/" --tags

echo -n "Head is at: "
git describe HEAD --tags --always

echo "Building Jekyll..."
jekyll build --trace --profile

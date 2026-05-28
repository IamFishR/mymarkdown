#!/usr/bin/env bash
set -euo pipefail

FILE="src/lib/version.ts"
root=$(git rev-parse --show-toplevel)
cd "$root"

current=$(grep -oP "(?<=APP_VERSION = ')[\d.]+" "$FILE")
IFS='.' read -r major minor patch <<< "$current"
new_version="$major.$minor.$((patch + 1))"

sed -i "s/APP_VERSION = '.*'/APP_VERSION = '$new_version'/" "$FILE"
git add "$FILE"

echo "bumped APP_VERSION: $current → $new_version"

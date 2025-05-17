#!/bin/bash

# This script is a workaround for the workspace protocol issue
# It replaces any workspace: references in node_modules with actual versions

echo "Fixing workspace protocol references..."

# Find all package.json files in node_modules
find ./node_modules -name "package.json" -type f -exec grep -l "workspace:" {} \; | while read file; do
  echo "Fixing $file"
  # Replace workspace:* with the actual version from the root package.json
  sed -i 's/"workspace:\*"/"*"/g' "$file"
  sed -i 's/"workspace:^"/"^"/g' "$file"
  sed -i 's/"workspace:~"/"~"/g' "$file"
done

echo "Fix complete!"

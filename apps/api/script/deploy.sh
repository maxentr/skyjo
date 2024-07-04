#!/bin/bash

# files in fly folder
FILES=$(find ./apps/api/fly -type f -name "*.toml")

# loop through files
for file in $FILES; do
  region_key=$(basename "$file" | sed 's/fly.//g' | sed 's/.toml//g')
  region_key=$(echo "$region_key" | tr '[:lower:]' '[:upper:]')

  echo "Deploying $region_key"
  flyctl deploy --config "$file" --dockerfile ./apps/api/Dockerfile
done

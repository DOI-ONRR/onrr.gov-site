#!/bin/bash

config_files=(parameters.yml)

config_files+=(cms-config.yml)

config_files+=(frontend-config.yml)

echo ${#config_files[@]}

merged="{}"

for file in "${config_files[@]}"; do
  if [ -f "$file" ]; then
    merged=$(yq eval-all '. as $item ireduce ({}; . * $item)' <(echo "$merged") "$file")
  else
    echo "Warning: $file does not exist. Skipping."
  fi
done

echo "$merged"
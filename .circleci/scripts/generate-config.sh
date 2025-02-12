#!/bin/bash

cd ~/project/.circleci

config_files=(parameters.yml)

if [ "$TRIGGER_SOURCE" = "scheduled_pipeline" ]; then
  cat restart-config.yml > generated-config.yml
  exit 0
elif [ "$TRIGGER_SOURCE" = "api" ]; then
  if [ "$BUILD_CMS" = "true" ]; then
    config_files+=(cms-config.yml)
  fi
  
  if [ "$BUILD_FRONTEND" = "true" ]; then
    config_files+=(frontend-config.yml)
  fi

  if [ "$BUILD_ROUTE_SERVICE" = "true" ]; then
    config_files+=(route-service-config.yml)
  fi
  
  if [ "$COPY_DATABASE" = "true" ]; then
    config_files+=(database-config.yml)
  fi

elif [ "$TRIGGER_SOURCE" = "webhook" ]; then
  last_commit=$(git rev-parse "$CIRCLE_BRANCH~1")

  changed_files=$(git diff --name-only "$last_commit" origin/main)

  echo "$changed_files" | grep -q '^cms/'
  cms_changed=$?

  echo "$changed_files" | grep -q '^frontend/'
  frontend_changed=$?

  echo "$changed_files" | grep -q '^route-service/'
  route_service_changed=$?

  if [ "$cms_changed" -eq 0 ]; then
    config_files+=(cms-config.yml)
  fi
  
  if [ "$frontend_changed" -eq 0 ]; then
    config_files+=(frontend-config.yml)
  fi

  if [ "$route_service_changed" -eq 0 ]; then
    config_files+=(route-service-config.yml)
  fi
  
fi

config_count=${#config_files[@]}

if [ "$config_count" -eq 1 ]; then
  cat <<EOF > generated-config.yml
version: 2.1
workflows: {}
EOF

  exit 0
fi

merged="{}"

for file in "${config_files[@]}"; do
  if [ -f "$file" ]; then
    merged=$(yq eval-all '. as $item ireduce ({}; . * $item)' <(echo "$merged") "$file")
  else
    echo "Warning: $file does not exist. Skipping."
  fi
done

echo "$merged" > generated-config.yml
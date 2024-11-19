#!/bin/bash

echo "TRIGGER_SOURCE: $TRIGGER_SOURCE"
echo "BUILD_CMS: $BUILD_CMS"
echo "BUILD_FRONTEND: $BUILD_FRONTEND"
echo "COPY_DATABASE: $COPY_DATABASE"
echo "CIRCLE_BRANCH: $CIRCLE_BRANCH"

cd ~/project/.circleci

if [ "$TRIGGER_SOURCE" = "api" ]; then
  if [ "$BUILD_CMS" = "true" ] && [ "$BUILD_FRONTEND" = "true" ]; then
    if [ "$COPY_DATABASE" = "true" ]; then
      yq eval-all 'select(fileIndex == 0) * select(fileIndex == 1)' frontend-config.yml cms-config.yml | yq eval-all 'select(fileIndex == 0) * select(fileIndex == 1)' - database-config.yml > generated-config.yml
    else
      yq eval-all 'select(fileIndex == 0) * select(fileIndex == 1)' frontend-config.yml cms-config.yml > generated-config.yml
    fi
  else
    if [ "$BUILD_CMS" = "true" ]; then
      cat cms-config.yml > generated-config.yml
    elif [ "$BUILD_FRONTEND" = "true" ]; then
      cat frontend-config.yml > generated-config.yml
    elif [ "$COPY_DATABASE" = "true" ]; then
      cat database-config.yml > generated-config.yml
    else
      cat <<EOF > generated-config.yml
version: 2.1
workflows: {}
EOF
    fi
  fi
elif [ "$TRIGGER_SOURCE" = "scheduled_pipeline" ]; then
  cat restart-config.yml > generated-config.yml
else
  last_commit=$(git rev-parse "$CIRCLE_BRANCH~1")

  changed_files=$(git diff --name-only "$last_commit" origin/main)

  echo "$changed_files" | grep -q '^cms/'
  cms_changed=$?

  echo "$changed_files" | grep -q '^frontend/'
  frontend_changed=$?

  if [ "$cms_changed" -eq 0 ] && [ "$frontend_changed" -eq 0 ]; then
    yq eval-all 'select(fileIndex == 0) * select(fileIndex == 1)' frontend-config.yml cms-config.yml > generated-config.yml
  elif [ "$cms_changed" -eq 0 ]; then
    cat cms-config.yml > generated-config.yml
  elif [ "$frontend_changed" -eq 0 ]; then
    cat frontend-config.yml > generated-config.yml
  else
    cat <<EOF > generated-config.yml
version: 2.1
workflows: {}
EOF
  fi
  
fi
#!/bin/bash

TEMP=$(getopt -o '' --long branch: -- "$@")
if [ $? != 0 ]; then
    echo "Terminating..." >&2
    exit 1
fi

eval set -- "$TEMP"

branch=""
manifest=""
space=""

while true; do
    case "$1" in
        --branch)
            branch=$2; shift 2 ;;
        --)
            shift; break ;;
        *)
            echo "Internal error!" >&2
            exit 1 ;;
    esac
done

if [ -z "$branch" ]; then
    echo "Error: --branch is required." >&2
    exit 1
fi

if [ "$branch" == "2290-upgrade-directus"]; then
    space="dev"
    manifest="manifest.upgrade.yml"
elif [ "$branch" == "dev" ]; then
    space="dev"
    manifest="dev.manifest.yml"
elif [ "$branch" == "main" ]; then
    space="prod"
    manifest="main.manifest.yml"
else
    space="dev"
    manifest="preview.manifest.yml"
fi

wget -q -O - https://packages.cloudfoundry.org/debian/cli.cloudfoundry.org.key | sudo apt-key add -

echo "deb https://packages.cloudfoundry.org/debian stable main" | sudo tee /etc/apt/sources.list.d/cloudfoundry-cli.list

sudo apt-get update

sudo apt-get install cf8-cli

cf login -u "$CF_USERNAME" -p "$CF_PASSWORD" -a api.fr.cloud.gov -o "$CF_ORG" -s "$space"

cf push --strategy=rolling -f "$manifest"

exit_code=$?

if [ $exit_code -ne 0 ]; then
  echo "Error: cf push failed with exit code $exit_code"
  exit $exit_code
else
  echo "manifest $manifest successfully deployed."
  exit 0
fi
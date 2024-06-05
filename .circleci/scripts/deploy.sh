#!/bin/bash

TEMP=$(getopt -o '' --long branch:,working-dir: -- "$@")
if [ $? != 0 ]; then
    echo "Terminating..." >&2
    exit 1
fi

eval set -- "$TEMP"

branch=""
manifest=""
working_dir=""
space=""

while true; do
    case "$1" in
        --branch)
            branch=$2; shift 2 ;;
        --working-dir)
            working_dir=$2; shift 2 ;;
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
elif [ -z "$working_dir"]; then
    echo "Error: --working-dir is required." >&2
    exit 1
fi

if [ "$branch" == "dev" ]; then
    space="dev"
    manifest="dev.manifest.yml"
elif [ "$branch" == "main" ]; then
    space="prod"
    manifest="main.manifest.yml"
else
    space="dev"
    manifest="preview.manifest.yml"
fi

cd "$working_dir"

wget -q -O - https://packages.cloudfoundry.org/debian/cli.cloudfoundry.org.key | sudo apt-key add -

echo "deb https://packages.cloudfoundry.org/debian stable main" | sudo tee /etc/apt/sources.list.d/cloudfoundry-cli.list

sudo apt-get update

sudo apt-get install cf8-cli

cf login -u "$CF_USERNAME" -p "$CF_PASSWORD" -a api.fr.cloud.gov -o "$CF_ORG" -s "$space"

cf push -f "$manifest"

echo "manifest $manifest successfully deployed."

exit 0
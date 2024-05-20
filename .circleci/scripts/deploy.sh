#!/bin/bash

TEMP=$(getopt -o '' --long branch:,app:,manifest: -- "$@")
if [ $? != 0 ]; then
    echo "Terminating..." >&2
    exit 1
fi

eval set -- "$TEMP"

branch=""
app=""
manifest=""
space=""
deploy_object=""

while true; do
    case "$1" in
        --branch)
            branch=$2; shift 2 ;;
        --app)
            app=$2; shift 2 ;;
        --manifest)
            manifest=$2; shift 2 ;;
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
elif [ -z "$app" ] || [-z "$manifest"]; then
    echo "Error: --app or --manifest is required." >&2
    exit 1
fi

if [ "$branch" == "dev" ]; then
    space="dev"
elif [ "$branch" == "main" ]; then
    space="prod"
else
    echo "Error: only dev and main are valid branches"
    exit 1
fi

if [ -n "$app" ]; then
    deploy_object="$space-$app"
elif [ -n "$manifest" ]; then
    deploy_object="$manifest"
fi

cd cms

wget -q -O - https://packages.cloudfoundry.org/debian/cli.cloudfoundry.org.key | sudo apt-key add -

echo "deb https://packages.cloudfoundry.org/debian stable main" | sudo tee /etc/apt/sources.list.d/cloudfoundry-cli.list

sudo apt-get update

sudo apt-get install cf8-cli

cf login -u "$CF_USERNAME" -p "$CF_PASSWORD" -a api.fr.cloud.gov -o "$CF_ORG" -s "$cf_space"

cf push "$deploy_object"

echo "$deploy_object successfully deployed."

exit 0
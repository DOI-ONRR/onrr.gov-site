#!/bin/bash

TEMP=$(getopt -o '' --long branch: -- "$@")
if [ $? != 0 ]; then
    echo "Terminating..." >&2
    exit 1
fi

eval set -- "$TEMP"

branch=""

while true; do
    case "$1" in
        --branch)
            name=$2; shift 2 ;;
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

cf_space=""
cf_app_name=""

if [ "$branch" == "dev" ]; then
    cf_space="dev"
elif [ "$branch" == "main" ]; then
    cf_space="prod"
else
    echo "Error: only dev and main are valid branches"
    exit 1
fi

cd cms

wget -q -O - https://packages.cloudfoundry.org/debian/cli.cloudfoundry.org.key | sudo apt-key add -

echo "deb https://packages.cloudfoundry.org/debian stable main" | sudo tee /etc/apt/sources.list.d/cloudfoundry-cli.list

sudo apt-get update

sudo apt-get install cf8-cli

cf api https://api.fr.cloud.gov

cf auth "$CF_USERNAME" "$CF_PASSWORD"

cf target -o "$CF_ORG" -s "$cf_space"

cf push "$cf_space-onrr-cms"

echo "Application $cf_space-onrr-cms successfully deployed."

exit 0
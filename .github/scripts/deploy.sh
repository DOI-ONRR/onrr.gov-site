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

if [ "$branch" == "upgrade-directus" ]; then
    space="dev"
    manifest="upgrade.manifest.yml"
elif [ "$branch" == "redesign/main" ]; then
    # TEMPORARY (redesign go-live): while the redesign lives on redesign/main,
    # deploy its CMS and route-service to the upgrade-* apps in the dev space
    # instead of preview-*. The legacy frontend/ pipeline is skipped on this
    # branch at the workflow level (see frontend.yml), so it never reaches here.
    # Remove this branch once redesign/main is merged into dev.
    space="dev"
    manifest="upgrade.manifest.yml"
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

# Install the Cloud Foundry CLI straight from the release tarball. We used to add the CF
# apt repo + signing key, but CF rotated the repo key (apt failed with NO_PUBKEY
# 172B5989FCD21EF8, so cf8-cli wouldn't install). The binary download has no apt/GPG
# dependency and won't break on a key rotation.
curl -fsSL "https://packages.cloudfoundry.org/stable?release=linux64-binary&version=v8&source=github" | sudo tar -zx -C /usr/local/bin
cf version

cf login -u "$CF_USERNAME" -p "$CF_PASSWORD" -a api.fr.cloud.gov -o "$CF_ORG" -s "$space"

cf push --strategy=rolling -f "$manifest"

exit_code=$?

if [ $exit_code -ne 0 ]; then
  echo "Error: cf push failed with exit code $exit_code"
  exit $exit_code
fi

# The upgrade env stages Directus 12.6.0 with a plain buildpack install, which needs
# ~4G to compile isolated-vm (see cms/upgrade.manifest.yml). Runtime only uses ~400M,
# so scale back to 1G once staging is done — stage big, run small — to free dev-space
# memory quota. Non-fatal: a scale failure leaves the app up (just larger), so it must
# not fail the deploy. TEMPORARY, tied to the redesign/main routing above.
if [ "$manifest" == "upgrade.manifest.yml" ]; then
  echo "Scaling upgrade-onrr-cms runtime back to 1G after staging..."
  cf scale upgrade-onrr-cms -m 1G -f || echo "Warning: scale-down failed; app remains at staging memory."
fi

echo "manifest $manifest successfully deployed."
exit 0
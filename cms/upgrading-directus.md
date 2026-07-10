## Push new Directus version (don’t start it)

```bash
cf push upgrade-onrr-cms -f upgrade.manifest.yml --no-start
```

## Verify the droplet version

```bash
cf run-task upgrade-onrr-cms \
  --command "node -p \"require('directus/package.json').version\"" \
  --name verify-droplet
```

## Run migrations explicitly

```bash
cf run-task upgrade-onrr-cms \
  --name migrate-directus-12.0.0 \
  --command "./node_modules/.bin/directus database migrate:latest"
```

## Start the app or trigger CI pipeline

```bash
cf start upgrade-onrr-cms
```

## Clearing buildpack cache

If ever you are pushing successive updates, you may need to clear the buildpack cache:

```bash
APP_GUID=$(cf app upgrade-onrr-cms --guid)
cf curl -X POST "/v3/apps/${APP_GUID}/actions/clear_buildpack_cache"
```

It may also be necessary to set some npm environment variables so that app staging prefers fresh tarballs rather than cached ones.

```bash
cf set-env upgrade-onrr-cms NPM_CONFIG_CACHE /tmp/npm-cache
cf set-env upgrade-onrr-cms NPM_CONFIG_PREFER_ONLINE true
cf set-env upgrade-onrr-cms NPM_CONFIG_AUDIT false
cf set-env upgrade-onrr-cms NPM_CONFIG_FUND false
cf restage upgrade-onrr-cms
```

## Deploy via actions

If you start seeing errors similar to the following after pushing locally, deploy via actions.

```
   2026-01-15T16:55:06.02-0500 [APP/TASK/migrate-directus-11.13.4/0] ERR node:internal/modules/esm/resolve:283
   2026-01-15T16:55:06.02-0500 [APP/TASK/migrate-directus-11.13.4/0] ERR throw new ERR_MODULE_NOT_FOUND(
   2026-01-15T16:55:06.02-0500 [APP/TASK/migrate-directus-11.13.4/0] ERR ^
   2026-01-15T16:55:06.02-0500 [APP/TASK/migrate-directus-11.13.4/0] ERR Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/home/vcap/app/node_modules/human-signals/build/src/main.js' imported from /home/vcap/app/node_modules/execa/lib/terminate/signal.js
```
# CMS `SECRET` / `KEY` rotation runbook

The Directus CMS reads `SECRET` and `KEY` from per-environment config (`cms/config.js` →
`env.SECRET` / `env.KEY`, set via `cf set-env`).

- **`SECRET`** is the HMAC key that signs every access/refresh JWT. Treat it as a high-value
  secret: anyone who obtains it can mint valid tokens (an authentication bypass), so it must be
  protected and rotated on exposure. On cloud.gov it is readable via `cf env` / `cf ssh` by anyone
  with a role on the app's space.
- **`KEY`** is a non-secret project identifier. It is not used for signing, so it does **not** need
  to be rotated for security — keep it stable. (Rotating it is low-impact but unnecessary.)

Each environment (`dev` / `preview` / `prod` / `upgrade`) has its own distinct `SECRET`.

## When to rotate `SECRET`

- **On suspected or confirmed exposure** (a leaked backup, a secret in a log, etc.).
- **Whenever someone with access to a space's environment offboards** — a departing member who had
  a role on that space could have read `SECRET` from `cf env`, and retains that knowledge until it
  is rotated. Rotate `SECRET` for **each space the person had access to** (rotate all four if in
  doubt).
- On a periodic cadence if your policy calls for one.

Also keep space membership least-privilege so this trigger fires as rarely as possible.

## How to rotate

Generate a fresh value (≥32 bytes; hex avoids shell-quoting issues):

```sh
openssl rand -hex 32
```

Set it and restage, per affected environment (prod shown):

```sh
cf target -o doi-onrr -s prod
cf set-env prod-onrr-cms SECRET '<new-value>'
cf restage prod-onrr-cms
```

App names per space: `dev-onrr-cms`, `preview-onrr-cms`, `prod-onrr-cms`, `upgrade-onrr-cms`.

## Impact & verification

- **Rotating `SECRET` invalidates all existing sessions and tokens** (forged and legitimate) — a
  one-time logout for everyone. That is the intended effect.
- After restage, confirm: log into `/admin`, then `cf restage` again and confirm you're **still
  logged in** (proves the new `SECRET` is stable), and the boot log has no
  `"SECRET" env variable is missing` warning.
- Do **not** commit `SECRET`/`KEY` values or paste them into tickets in plaintext.

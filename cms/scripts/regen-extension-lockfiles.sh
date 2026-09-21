#!/usr/bin/env bash
#
# regen-extension-lockfiles.sh — keep CMS extension package-lock.json files in sync with Linux CI.
#
# Extension lockfiles are committed, but `npm install` on macOS can produce a lock that the Linux
# CI runner's `npm ci` rejects (the @emnapi / wasm-binding optional-dep drift). This regenerates the
# affected lock(s) inside a throwaway Linux container that matches CI, verifying `npm ci` passes.
# All npm work happens on a /tmp copy inside the container, so your host node_modules are untouched
# and only the package-lock.json is written back (and only if it actually changes).
#
# Usage:
#   cms/scripts/regen-extension-lockfiles.sh [--changed | --staged | --all] [--check] [<ext-dir>...]
#
#     --changed   (default) extensions whose package.json / package-lock.json differ from HEAD
#     --staged    extensions with STAGED package.json / package-lock.json changes
#     --all       every extension under cms/src/extensions/*/*/
#     --check     verify only — report extensions whose `npm ci` fails and exit non-zero; write nothing
#     <ext-dir>   one or more explicit extension dirs (repo-relative or cms-relative)
#
# Env:
#   LOCKFILE_PLATFORM   Docker platform (default: linux/amd64 — exactly matches CI).
#                       linux/arm64 is much faster on Apple Silicon and produces an equivalent lock.
#   NODE_IMAGE          Node image (default: node:22 — matches the CI node-version).
#
# Requires Docker. Exit code: 0 if all target locks pass (or were fixed); non-zero otherwise.
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
CMS="$ROOT/cms"
PLATFORM="${LOCKFILE_PLATFORM:-linux/amd64}"
IMAGE="${NODE_IMAGE:-node:22}"

mode="changed"
check="run"
explicit=()
for arg in "$@"; do
	case "$arg" in
		--changed) mode="changed" ;;
		--staged)  mode="staged" ;;
		--all)     mode="all" ;;
		--check)   check="check" ;;
		-h|--help) sed -n '2,30p' "$0"; exit 0 ;;
		*)         explicit+=("$arg") ;;
	esac
done

command -v docker >/dev/null 2>&1 || { echo "error: docker is required (matches the Linux CI runner)" >&2; exit 2; }

# Collect target extension dirs, cms-relative with a trailing slash (e.g. src/extensions/hooks/foo/).
declare -a dirs=()
ext_dir_of() { # normalize a path to src/extensions/<type>/<name>/
	sed -E 's#.*(src/extensions/[^/]+/[^/]+/).*#\1#'
}
if [ "${#explicit[@]}" -gt 0 ]; then
	for e in "${explicit[@]}"; do dirs+=("$(echo "$e" | ext_dir_of)"); done
elif [ "$mode" = "all" ]; then
	while IFS= read -r d; do dirs+=("${d#"$CMS"/}"); done < <(find "$CMS/src/extensions" -mindepth 2 -maxdepth 2 -name package.json -exec dirname {} \; | sort)
else
	diffargs=(--name-only)
	[ "$mode" = "staged" ] && diffargs=(--cached --name-only) || diffargs=(--name-only HEAD)
	while IFS= read -r f; do
		[ -n "$f" ] && dirs+=("$(echo "$f" | ext_dir_of)")
	done < <(cd "$ROOT" && git diff "${diffargs[@]}" -- 'cms/src/extensions/*/*/package.json' 'cms/src/extensions/*/*/package-lock.json')
fi

# de-dupe, keep only real extension dirs with a lockfile
declare -a targets=()
for d in "${dirs[@]:-}"; do
	[ -n "$d" ] || continue
	case " ${targets[*]:-} " in *" $d "*) continue ;; esac
	[ -f "$CMS/$d/package.json" ] && targets+=("$d")
done

if [ "${#targets[@]}" -eq 0 ]; then
	echo "No extension package changes to check."
	exit 0
fi

echo "Checking ${#targets[@]} extension lockfile(s) on $PLATFORM ($IMAGE):"
printf '  %s\n' "${targets[@]}"

docker run --rm --platform "$PLATFORM" -v "$CMS":/cms "$IMAGE" sh -c '
set -u
cd /cms
CHECK="$1"; shift
rc=0
for d in "$@"; do
	[ -f "${d}package.json" ] || { echo "SKIP (no package.json): $d"; continue; }
	W=$(mktemp -d)
	cp "${d}package.json" "$W/"
	[ -f "${d}package-lock.json" ] && cp "${d}package-lock.json" "$W/"
	if [ -f "$W/package-lock.json" ] && (cd "$W" && npm ci --no-audit --no-fund >/dev/null 2>&1); then
		echo "OK: $d"; rm -rf "$W"; continue
	fi
	if [ "$CHECK" = "check" ]; then
		echo "FAIL (npm ci out of sync): $d"; rc=1; rm -rf "$W"; continue
	fi
	(cd "$W" && rm -f package-lock.json && rm -rf node_modules && npm install --no-audit --no-fund >/dev/null 2>&1)
	if (cd "$W" && rm -rf node_modules && npm ci --no-audit --no-fund >/dev/null 2>&1); then
		if cmp -s "$W/package-lock.json" "${d}package-lock.json" 2>/dev/null; then
			echo "OK (no change): $d"
		else
			cp "$W/package-lock.json" "${d}package-lock.json"; echo "FIXED: $d"
		fi
	else
		echo "ERROR (could not make npm ci pass): $d"; rc=1
	fi
	rm -rf "$W"
done
exit $rc
' sh "$check" "${targets[@]}"

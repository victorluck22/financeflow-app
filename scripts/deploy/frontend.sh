#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 3 ]]; then
  echo "Usage: $0 <deploy_path> <cloudpanel_docroot> <release_id> [releases_to_keep]"
  echo "  deploy_path        : base do projeto, ex: /home/lucksystems-app-financeflow"
  echo "  cloudpanel_docroot : caminho htdocs do site no CloudPanel (sera convertido em symlink)"
  echo "  release_id         : identificador unico do release (gerado pelo pipeline)"
  exit 1
fi

DEPLOY_PATH="$1"
CLOUDPANEL_DOCROOT="$2"
RELEASE_ID="$3"
RELEASES_TO_KEEP="${4:-5}"

RELEASE_ROOT="${DEPLOY_PATH}/releases/${RELEASE_ID}"
SOURCE_ROOT="${RELEASE_ROOT}/source"
APP_RELEASE="${RELEASE_ROOT}/app"
CURRENT_LINK="${CLOUDPANEL_DOCROOT}"

if [[ -e "${CURRENT_LINK}" && ! -L "${CURRENT_LINK}" ]]; then
  echo "CloudPanel docroot must be a symlink before deploy: ${CURRENT_LINK}"
  exit 1
fi

if [[ ! -d "${SOURCE_ROOT}/dist" ]]; then
  echo "Expected built frontend not found: ${SOURCE_ROOT}/dist"
  exit 1
fi

mkdir -p "${DEPLOY_PATH}/releases"
rm -rf "${APP_RELEASE}"
mkdir -p "${APP_RELEASE}"
rsync -a --delete "${SOURCE_ROOT}/dist/" "${APP_RELEASE}/"

ln -sfn "${APP_RELEASE}" "${CURRENT_LINK}"

# Only rotate directories that look like release IDs (YYYYMMDDHHMMSS-abcdef0).
mapfile -t RELEASE_DIRS < <(
  find "${DEPLOY_PATH}/releases" -mindepth 1 -maxdepth 1 -type d -printf "%f\n" \
    | grep -E '^[0-9]{14}-[0-9a-f]{7}$' \
    | sort -r
)

if (( ${#RELEASE_DIRS[@]} > RELEASES_TO_KEEP )); then
  for RELEASE_NAME in "${RELEASE_DIRS[@]:RELEASES_TO_KEEP}"; do
    OLD_RELEASE="${DEPLOY_PATH}/releases/${RELEASE_NAME}"
    if rm -rf "${OLD_RELEASE}"; then
      echo "Removed old release: ${OLD_RELEASE}"
    else
      echo "Warning: failed to remove old release (continuing): ${OLD_RELEASE}"
    fi
  done
fi

echo "Frontend deployment complete: ${RELEASE_ID}"
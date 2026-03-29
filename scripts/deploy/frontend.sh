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

if [[ ! -d "${SOURCE_ROOT}/dist" ]]; then
  echo "Expected built frontend not found: ${SOURCE_ROOT}/dist"
  exit 1
fi

mkdir -p "${DEPLOY_PATH}/releases"
rm -rf "${APP_RELEASE}"
mkdir -p "${APP_RELEASE}"
rsync -a --delete "${SOURCE_ROOT}/dist/" "${APP_RELEASE}/"

ln -sfn "${APP_RELEASE}" "${CURRENT_LINK}"

mapfile -t OLD_RELEASES < <(ls -1dt "${DEPLOY_PATH}/releases"/* 2>/dev/null | tail -n +$((RELEASES_TO_KEEP + 1)))
for OLD_RELEASE in "${OLD_RELEASES[@]:-}"; do
  rm -rf "${OLD_RELEASE}"
done

echo "Frontend deployment complete: ${RELEASE_ID}"
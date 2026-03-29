#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 3 ]]; then
  echo "Usage: $0 <deploy_path> <cloudpanel_docroot> <release_id>"
  echo "  deploy_path        : base do projeto, ex: /home/lucksystems-app-financeflow"
  echo "  cloudpanel_docroot : caminho htdocs do site no CloudPanel"
  echo "  release_id         : ID do release para o qual reverter"
  exit 1
fi

DEPLOY_PATH="$1"
CLOUDPANEL_DOCROOT="$2"
RELEASE_ID="$3"
TARGET="${DEPLOY_PATH}/releases/${RELEASE_ID}/app"
CURRENT_LINK="${CLOUDPANEL_DOCROOT}"

if [[ ! -d "${TARGET}" ]]; then
  echo "Release not found: ${TARGET}"
  exit 1
fi

ln -sfn "${TARGET}" "${CURRENT_LINK}"

echo "Frontend rollback complete: ${RELEASE_ID}"
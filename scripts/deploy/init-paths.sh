#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <app_deploy_path>"
  exit 1
fi

APP_PATH="$1"

mkdir -p "$APP_PATH/releases"

echo "Initialized frontend deploy paths: $APP_PATH"
#!/bin/sh
set -eu
plannotator_gmail_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
export PLANNOTATOR_INBOX_CONNECT="${PLANNOTATOR_INBOX_CONNECT:-0}"
export PLANNOTATOR_DATA_DIR="${PLANNOTATOR_DATA_DIR:-${HOME}/.plannotator-gmail}"
plannotator_gmail_binary="${PLANNOTATOR_GMAIL_BINARY:-${plannotator_gmail_root}/.local/runtime/plannotator}"
if [ ! -x "$plannotator_gmail_binary" ]; then
  echo 'Build plannotator-gmail first; see docs/plannotator-gmail/README.md.' >&2
  exit 1
fi
if [ "$#" -eq 0 ]; then set -- inbox; fi
exec "$plannotator_gmail_binary" "$@"

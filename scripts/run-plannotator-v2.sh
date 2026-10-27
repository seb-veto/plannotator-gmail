#!/bin/sh
set -eu
# Historical launcher name in the Gmail checkout must use Gmail's separate data.
exec "$(dirname -- "$0")/run-plannotator-gmail.sh" "$@"

#!/bin/sh
# Wrapper for wasmtime

if [ -z "$bas7800dir" ]; then
  echo "### ERROR: bas7800dir not set"
  exit 1
fi

if ! command -v wasmtime >/dev/null 2>&1; then
  echo "### ERROR: wasmtime not found in PATH"
  exit 1
fi

BNAME=$(basename "$0"|cut -d. -f1)
wasmtime run --dir=. --dir="$bas7800dir" "$bas7800dir/$BNAME.wasm" "$@"


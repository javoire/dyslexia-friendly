#!/usr/bin/env bash

set -e

package_name="${PACKAGE_NAME:-dyslexia-friendly.zip}"

cd build/extension
zip -r ../"${package_name}" ./*

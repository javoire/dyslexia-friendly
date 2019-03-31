#!/usr/bin/env bash

package_name="${PACKAGE_NAME:-dyslexia-friendly.zip}"
cd build
zip -r ../"${package_name}" *

#!/usr/bin/env bash

set -e

# Upload and publish to Chrome Web Store

echo "------- Init -------"
VERSION=$(jq -r '.version' src/extension/manifest.json)
echo "Uploading version: ${VERSION}"
ACCESS_TOKEN=$(curl --fail "https://oauth2.googleapis.com/token" -d "client_secret=${CLIENT_SECRET}&grant_type=refresh_token&refresh_token=${REFRESH_TOKEN}&client_id=${CLIENT_ID}" | jq -r .access_token)
echo "------- Upload -------"
curl --fail -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "x-goog-api-version: 2" -X PUT -T "${PACKAGE_PATH}" "https://www.googleapis.com/upload/chromewebstore/v1.1/items/${APP_ID}"
echo "------- Publish -------"
# this last call will fail and return 400 if the extension was recently published and is still stuck in review:
curl --fail -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "x-goog-api-version: 2" -H "Content-Length: 0" -X POST "https://www.googleapis.com/chromewebstore/v1.1/items/${APP_ID}/publish"

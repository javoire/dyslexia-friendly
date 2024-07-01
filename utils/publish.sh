#!/usr/bin/env bash

set -e

# Upload and publish to Chrome Web Store

echo "------- Init -------"
ACCESS_TOKEN=$(curl --fail "https://accounts.google.com/o/oauth2/token" -d "client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&refresh_token=${REFRESH_TOKEN}&grant_type=refresh_token&redirect_uri=urn:ietf:wg:oauth:2.0:oob" | jq -r .access_token)
echo "------- Upload -------"
curl --fail -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "x-goog-api-version: 2" -X PUT -T "${PACKAGE_PATH}" "https://www.googleapis.com/upload/chromewebstore/v1.1/items/${APP_ID}"
echo "------- Publish -------"
# will fail and return 400 if the extension was recently published and is still stuck in review
#curl --fail -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "x-goog-api-version: 2" -H "Content-Length: 0" -X POST "https://www.googleapis.com/chromewebstore/v1.1/items/${APP_ID}/publish"


#!/usr/bin/env bash

set -euo pipefail

LATEST_TAG=$(git tag --sort=-v:refname | head -n1)
if [ -z "$LATEST_TAG" ]; then
  echo "should_publish=false" >> "$GITHUB_OUTPUT"
  echo "reason=No git tags found" >> "$GITHUB_OUTPUT"
  exit 0
fi

TOKEN_BODY=$(curl -sS "https://oauth2.googleapis.com/token" \
  --fail \
  -d "client_secret=${CLIENT_SECRET}&grant_type=refresh_token&refresh_token=${REFRESH_TOKEN}&client_id=${CLIENT_ID}") \
  || { echo "OAuth token exchange failed" >&2; exit 1; }

ACCESS_TOKEN=$(printf '%s' "${TOKEN_BODY}" | jq -r .access_token)

PUBLISHED_BODY=$(curl -sS --fail \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "x-goog-api-version: 2" \
  "https://www.googleapis.com/chromewebstore/v1.1/items/${APP_ID}?projection=DRAFT") \
  || { echo "Chrome Web Store API failed" >&2; exit 1; }

PUBLISHED_VERSION=$(printf '%s' "${PUBLISHED_BODY}" | jq -r .crxVersion)
LATEST_VERSION="${LATEST_TAG#v}"
SHOULD_PUBLISH=false

if [ "$LATEST_VERSION" != "$PUBLISHED_VERSION" ]; then
  NEWER=$(printf '%s\n' "$PUBLISHED_VERSION" "$LATEST_VERSION" | sort -V | tail -n1)
  if [ "$NEWER" = "$LATEST_VERSION" ]; then
    SHOULD_PUBLISH=true
  fi
fi

echo "latest_tag=${LATEST_TAG}" >> "$GITHUB_OUTPUT"
echo "latest_version=${LATEST_VERSION}" >> "$GITHUB_OUTPUT"
echo "published_version=${PUBLISHED_VERSION}" >> "$GITHUB_OUTPUT"
echo "should_publish=${SHOULD_PUBLISH}" >> "$GITHUB_OUTPUT"

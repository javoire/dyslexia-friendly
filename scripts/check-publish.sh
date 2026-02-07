#!/usr/bin/env bash

set -euo pipefail

LATEST_TAG=$(git tag --sort=-v:refname | head -n1)
if [ -z "$LATEST_TAG" ]; then
  echo "should_publish=false" >> "$GITHUB_OUTPUT"
  echo "reason=No git tags found" >> "$GITHUB_OUTPUT"
  exit 0
fi

TOKEN_RESPONSE=$(curl -sS -w "\n%{http_code}" "https://oauth2.googleapis.com/token" \
  -d "client_secret=${CLIENT_SECRET}&grant_type=refresh_token&refresh_token=${REFRESH_TOKEN}&client_id=${CLIENT_ID}")
TOKEN_STATUS=$(printf '%s' "${TOKEN_RESPONSE}" | tail -n1)

if [ "${TOKEN_STATUS}" != "200" ]; then
  echo "OAuth token exchange failed" >&2
  exit 1
fi

ACCESS_TOKEN=$(printf '%s' "${TOKEN_RESPONSE}" | sed '$d' | jq -r .access_token)

PUBLISHED_RESPONSE=$(curl -sS -w "\n%{http_code}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "x-goog-api-version: 2" \
  "https://www.googleapis.com/chromewebstore/v1.1/items/${APP_ID}?projection=DRAFT")
PUBLISHED_STATUS=$(printf '%s' "${PUBLISHED_RESPONSE}" | tail -n1)

if [ "${PUBLISHED_STATUS}" != "200" ]; then
  echo "Chrome Web Store API failed" >&2
  exit 1
fi

PUBLISHED_VERSION=$(printf '%s' "${PUBLISHED_RESPONSE}" | sed '$d' | jq -r .crxVersion)
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

#!/bin/bash

# BEGIN EDITS
export HUB_URL='http://dev-uos-mediahub.azurewebsites.net'
export HUB_PASSWORD='kittens'
export PORT=3001
export SWAGGER_JSON='/api-docs.json'
export SWAGGER_HOST='localhost:3001'
export ASSET_STORE='http://dev-uos-assetstore.azurewebsites.net'
# END EDITS

$@
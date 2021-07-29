#!/usr/bin/env bash

set -e

export DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

: "${ADDRESS_MINT_TO?Need to set ADDRESS_MINT_TO}"
: "${TOKEN_MINTERS?Need to set TOKEN_MINTERS}"

: "${ETH_PRIVATE_KEY?Need to set ETH_PRIVATE_KEY}"
: "${ENDPOINT?Need to set ENDPOINT}"

: "${NETWORK_NAME?Need to set NETWORK_NAME}"

cd $DIR/../test/test_tokens

yarn install
rm -rf ./build || true
rm -f ./data/TestTokens.abi.$NETWORK_NAME.json || true

npx truffle compile
npx truffle migrate --network=$NETWORK_NAME
ls -1 ./data
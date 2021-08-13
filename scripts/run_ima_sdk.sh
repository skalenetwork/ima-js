#!/usr/bin/env bash

set -e

export DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
export IMA_SDK_DIR=$DIR/../skale-ima-sdk

: "${PRIVATE_KEY_FOR_ETHEREUM?Need to set PRIVATE_KEY_FOR_ETHEREUM}"
: "${ACCOUNT_FOR_ETHEREUM?Need to set ACCOUNT_FOR_ETHEREUM}"

: "${PRIVATE_KEY_FOR_SCHAIN?Need to set PRIVATE_KEY_FOR_SCHAIN}"
: "${ACCOUNT_FOR_SCHAIN?Need to set ACCOUNT_FOR_SCHAIN}"

URL_W3_ETHEREUM=http://ganache:8545 bash $IMA_SDK_DIR/run_compose.sh

#!/usr/bin/env bash

set -e

set_vars () {
    export DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
    export $(grep -v '^#' $DIR/../.env | xargs)

    : "${MAINNET_ADDRESS?Need to set MAINNET_ADDRESS}"
    : "${MAINNET_PRIVATE_KEY?Need to set MAINNET_PRIVATE_KEY}"
    : "${MAINNET_ENDPOINT?Need to set MAINNET_ENDPOINT}"

    : "${SCHAIN_PRIVATE_KEY?Need to set SCHAIN_PRIVATE_KEY}"
    : "${SCHAIN_ENDPOINT?Need to set SCHAIN_ENDPOINT}"

    export PRIVATE_KEY_FOR_ETHEREUM=$MAINNET_PRIVATE_KEY
    export URL_W3_ETHEREUM=$MAINNET_ENDPOINT
    export PRIVATE_KEY_FOR_SCHAIN=$SCHAIN_PRIVATE_KEY
    export URL_W3_S_CHAIN=$SCHAIN_ENDPOINT

    export MINT_AMOUNT='1000'
    export TOKEN_NAME='TEST'
    export TOKEN_SYMBOL='TST'
}

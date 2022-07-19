#!/usr/bin/env bash

set -e

set_vars () {
    export DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
    
    if [ -f $DIR/../.env ]; then
        export $(grep -v '^#' $DIR/../.env | xargs)
    fi

    : "${TEST_PRIVATE_KEY?Need to set TEST_PRIVATE_KEY}"
    : "${TEST_ADDRESS?Need to set TEST_ADDRESS}"

    : "${MAINNET_ENDPOINT?Need to set MAINNET_ENDPOINT}"
    : "${SCHAIN_ENDPOINT?Need to set SCHAIN_ENDPOINT}"

    export PRIVATE_KEY_FOR_ETHEREUM=$TEST_PRIVATE_KEY
    export URL_W3_ETHEREUM=$MAINNET_ENDPOINT
    export PRIVATE_KEY_FOR_SCHAIN=$TEST_PRIVATE_KEY
    export URL_W3_S_CHAIN=$SCHAIN_ENDPOINT

    export MINT_AMOUNT='1000'
    export TOKEN_NAME='TEST'
    export TOKEN_SYMBOL='TST'

    export TOKEN_NAME_S2S='TEST_S2S'
    export TOKEN_SYMBOL_S2S='TSTS2S'

    export ETH_ERC20_ADDRESS='0xD2Aaa00700000000000000000000000000000000'
}

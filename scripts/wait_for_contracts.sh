#!/usr/bin/env bash

set -e

export DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
export IMA_SDK_DIR=$DIR/../skale-ima-sdk

COUNTER=0
RETRIES_COUNT=20
SLEEP_TIMEOUT=5

MAINNET_CONTRACTS_ABI_PATH=$IMA_SDK_DIR/contracts_data/proxyMainnet.json
SCHAIN_CONTRACTS_ABI_PATH=$IMA_SDK_DIR/contracts_data/proxySchain_Bob.json

while [ ! -f $MAINNET_CONTRACTS_ABI_PATH ]; do
    echo "Waiting for mainnet contracts $COUNTER/$RETRIES_COUNT";
    if [ $COUNTER -ge $RETRIES_COUNT ]; then
        echo "Contracts wasn't deployed on time :("
        exit 1;
    fi
    COUNTER=$[COUNTER + 1];
    sleep $SLEEP_TIMEOUT;
done
echo "Mainnet contracts deployed: $MAINNET_CONTRACTS_ABI_PATH"

while [ ! -f $SCHAIN_CONTRACTS_ABI_PATH ]; do
    echo "Waiting for sChain contracts $COUNTER/$RETRIES_COUNT";
    if [ $COUNTER -ge $RETRIES_COUNT ]; then
        echo "Contracts wasn't deployed on time :("
        exit 1;
    fi
    COUNTER=$[COUNTER + 1];
    sleep $SLEEP_TIMEOUT;
done
echo "sChain contracts deployed: $SCHAIN_CONTRACTS_ABI_PATH"

#!/usr/bin/env bash

set -e

export DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
export IMA_SDK_DIR=$DIR/../skale-ima-sdk

while [ ! -f $IMA_SDK_DIR/contracts_data/proxySchain_Bob.json ]; do echo "Waiting for contracts"; sleep 5; done

cat $IMA_SDK_DIR/contracts_data/proxySchain_Bob.json
echo 'DONE!'
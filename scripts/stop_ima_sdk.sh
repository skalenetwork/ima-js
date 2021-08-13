#!/usr/bin/env bash

set -e

export DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
export IMA_SDK_DIR=$DIR/../skale-ima-sdk

rm -rf $IMA_SDK_DIR/data_dir/
rm -rf $IMA_SDK_DIR/dev_dir/

cd $IMA_SDK_DIR
docker-compose down

#!/usr/bin/env bash

set -e

export DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

if [ $INSTALL_PACKAGES == 'True' ]; then
    cd $DIR/../test-tokens
    yarn install
fi

bash $DIR/deploy_erc20.sh
bash $DIR/deploy_erc721.sh
bash $DIR/deploy_erc1155.sh

#!/usr/bin/env bash

set -e

export DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

cd $DIR/../test-tokens

if [ $INSTALL_PACKAGES == 'True' ]; then
    yarn install
fi

bash $DIR/deploy_erc20.sh
bash $DIR/deploy_erc721.sh
bash $DIR/deploy_erc721_with_metadata.sh
bash $DIR/deploy_erc1155.sh

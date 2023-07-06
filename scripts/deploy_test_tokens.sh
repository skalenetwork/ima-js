#!/usr/bin/env bash

set -e

export DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

cd $DIR/../test-tokens


ARTIFACTS_FILE=$DIR/../test-tokens/artifacts/contracts/ERC20Example.sol/ERC20Example.json

if [ "$INSTALL_PACKAGES" == 'True' ]; then
    until [ -f "$ARTIFACTS_FILE" ]
    do
        echo "Contracts was not compiled, trying to compile"
        yarn install
    done
fi

echo "Hardhat version:"
npx hardhat --version

bash $DIR/deploy_erc20.sh
bash $DIR/deploy_erc721.sh
bash $DIR/deploy_erc721_with_metadata.sh
bash $DIR/deploy_erc1155.sh

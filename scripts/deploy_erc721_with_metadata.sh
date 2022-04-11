#!/usr/bin/env bash

set -e

export DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
source $DIR/helper.sh
set_vars

cd $DIR/../test-tokens

TOKEN_MANAGER_ERC_721_META_ADDRESS=$(cat $DIR/../skale-ima-sdk/contracts_data/proxySchain.json | jq -r ".token_manager_erc721_with_metadata_address")
TEST_TOKEN_ID='1'

npx hardhat erc721meta --name $TOKEN_NAME --symbol $TOKEN_SYMBOL --network mainnet
npx hardhat erc721meta --name $TOKEN_NAME --symbol $TOKEN_SYMBOL --network schain

MAINNET_ERC_721_META_ADDRESS=$(cat $DIR/../test-tokens/data/ERC721MetaExample-$TOKEN_NAME-mainnet.json | jq -r ".erc721meta_address")
SCHAIN_ERC_721_META_ADDRESS=$(cat $DIR/../test-tokens/data/ERC721MetaExample-$TOKEN_NAME-schain.json | jq -r ".erc721meta_address")

echo Token manager addres: $TOKEN_MANAGER_ERC_721_META_ADDRESS
echo Mainnet token: $MAINNET_ERC_721_META_ADDRESS
echo sChain token: $SCHAIN_ERC_721_META_ADDRESS

npx hardhat add-minter-erc721-meta --token-address $SCHAIN_ERC_721_META_ADDRESS --address $TOKEN_MANAGER_ERC_721_META_ADDRESS --network schain
npx hardhat mint-erc721 --token-address $MAINNET_ERC_721_META_ADDRESS --receiver-address $TEST_ADDRESS --token-id $TEST_TOKEN_ID --network mainnet

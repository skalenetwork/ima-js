#!/usr/bin/env bash

set -e

export DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
source $DIR/helper.sh
set_vars

cd $DIR/../test-tokens

TOKEN_MANAGER_ERC_721_ADDRESS=$(cat $DIR/../skale-ima-sdk/contracts_data/proxySchain.json | jq -r ".token_manager_erc721_address")
TEST_TOKEN_ID='1'

npx hardhat erc721 --name $TOKEN_NAME --symbol $TOKEN_SYMBOL --network mainnet
npx hardhat erc721 --name $TOKEN_NAME --symbol $TOKEN_SYMBOL --network schain

MAINNET_ERC_721_ADDRESS=$(cat $DIR/../test-tokens/data/ERC721Example-$TOKEN_NAME-mainnet.json | jq -r ".erc721_address")
SCHAIN_ERC_721_ADDRESS=$(cat $DIR/../test-tokens/data/ERC721Example-$TOKEN_NAME-schain.json | jq -r ".erc721_address")

npx hardhat add-minter-erc721 --token-address $SCHAIN_ERC_721_ADDRESS --address $TOKEN_MANAGER_ERC_721_ADDRESS --network schain
npx hardhat mint-erc721 --token-address $MAINNET_ERC_721_ADDRESS --receiver-address $MAINNET_ADDRESS --token-id $TEST_TOKEN_ID --network mainnet

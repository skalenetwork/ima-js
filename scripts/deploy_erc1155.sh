#!/usr/bin/env bash

set -e

export DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
source $DIR/helper.sh
set_vars

cd $DIR/../test-tokens

TOKEN_MANAGER_ERC_1155_ADDRESS=$(cat $DIR/../abis/proxySchain.json | jq -r ".token_manager_erc1155_address")

TEST_TOKEN_IDS='[1,2,3]'
TEST_TOKEN_AMOUNTS='[1000,1000,1000]'

npx hardhat erc1155 --uri $TOKEN_NAME --network mainnet
npx hardhat erc1155 --uri $TOKEN_NAME --network schain

MAINNET_ERC_1155_ADDRESS=$(cat $DIR/../test-tokens/data/ERC1155Example-$TOKEN_NAME-mainnet.json | jq -r ".erc1155_address")
SCHAIN_ERC_1155_ADDRESS=$(cat $DIR/../test-tokens/data/ERC1155Example-$TOKEN_NAME-schain.json | jq -r ".erc1155_address")

npx hardhat add-minter-erc1155 --token-address $SCHAIN_ERC_1155_ADDRESS --address $TOKEN_MANAGER_ERC_1155_ADDRESS --network schain
npx hardhat mint-erc1155 --token-address $MAINNET_ERC_1155_ADDRESS --receiver-address $MAINNET_ADDRESS --token-id $TEST_TOKEN_IDS --amount $TEST_TOKEN_AMOUNTS --batch true --network mainnet
npx hardhat mint-erc1155 --token-address $MAINNET_ERC_1155_ADDRESS --receiver-address $MAINNET_ADDRESS --token-id 4 --amount 1000 --data 0xabbccddeef12233445 --network mainnet

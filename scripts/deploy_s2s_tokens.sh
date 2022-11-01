#!/usr/bin/env bash

set -e

export DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
source $DIR/helper.sh
set_vars

cd $DIR/../test-tokens

# erc721

TOKEN_MANAGER_ERC_721_ADDRESS=$(cat $DIR/../skale-ima-sdk/contracts_data/proxySchain.json | jq -r ".token_manager_erc721_address")
TEST_TOKEN_ID='1'

npx hardhat erc721 --name $TOKEN_NAME_S2S --symbol $TOKEN_SYMBOL_S2S --network schain

SCHAIN_ERC_721_ADDRESS=$(cat $DIR/../test-tokens/data/ERC721Example-$TOKEN_NAME_S2S-schain.json | jq -r ".erc721_address")

npx hardhat mint-erc721 --token-address $SCHAIN_ERC_721_ADDRESS --receiver-address $TEST_ADDRESS --token-id $TEST_TOKEN_ID --network schain

# erc20

TOKEN_MANAGER_ERC_20_ADDRESS=$(cat $DIR/../skale-ima-sdk/contracts_data/proxySchain.json | jq -r ".token_manager_erc20_address")

npx hardhat erc20 --name $TOKEN_NAME_S2S --symbol $TOKEN_SYMBOL_S2S --network schain

SCHAIN_ERC_20_ADDRESS=$(cat $DIR/../test-tokens/data/ERC20Example-$TOKEN_NAME_S2S-schain.json | jq -r ".erc20_address")

npx hardhat mint-erc20 --token-address $SCHAIN_ERC_20_ADDRESS --receiver-address $TEST_ADDRESS --amount $MINT_AMOUNT --network schain


# erc1155

ERC1155_NAME='MEDALS2S'
TOKEN_MANAGER_ERC_1155_ADDRESS=$(cat $DIR/../skale-ima-sdk/contracts_data/proxySchain.json | jq -r ".token_manager_erc1155_address")

TEST_TOKEN_IDS='[1,2,3,4,5]'
TEST_TOKEN_AMOUNTS='[100,2000,30000,400000,5000000]'

npx hardhat erc1155 --uri $ERC1155_NAME --network schain

ERC_1155_ADDRESS=$(cat $DIR/../test-tokens/data/ERC1155Example-$ERC1155_NAME-schain.json | jq -r ".erc1155_address")

npx hardhat mint-erc1155 --token-address $ERC_1155_ADDRESS --receiver-address $TEST_ADDRESS --token-id $TEST_TOKEN_IDS --amount $TEST_TOKEN_AMOUNTS --batch true --network schain


# eth wrap

npx hardhat erc20-wrap --name WRETH --symbol WRETH --wrap $ETH_ERC20_ADDRESS --network schain

# erc20 wrap

npx hardhat erc20-wrap --name w$TOKEN_NAME_S2S --symbol w$TOKEN_NAME_S2S --wrap $SCHAIN_ERC_20_ADDRESS --network schain

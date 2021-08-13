#!/usr/bin/env bash

set -e

export DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
source $DIR/helper.sh
set_vars

cd $DIR/../test-tokens

TOKEN_MANAGER_ERC_20_ADDRESS=$(cat $DIR/../skale-ima-sdk/contracts_data/proxySchain.json | jq -r ".token_manager_erc20_address")

npx hardhat erc20 --name $TOKEN_NAME --symbol $TOKEN_SYMBOL --network mainnet
npx hardhat erc20 --name $TOKEN_NAME --symbol $TOKEN_SYMBOL --network schain

MAINNET_ERC_20_ADDRESS=$(cat $DIR/../test-tokens/data/ERC20Example-$TOKEN_NAME-mainnet.json | jq -r ".erc20_address")
SCHAIN_ERC_20_ADDRESS=$(cat $DIR/../test-tokens/data/ERC20Example-$TOKEN_NAME-schain.json | jq -r ".erc20_address")

npx hardhat add-minter-erc20 --token-address $SCHAIN_ERC_20_ADDRESS --address $TOKEN_MANAGER_ERC_20_ADDRESS --network schain
npx hardhat mint-erc20 --token-address $MAINNET_ERC_20_ADDRESS --receiver-address $MAINNET_ADDRESS --amount $MINT_AMOUNT --network mainnet

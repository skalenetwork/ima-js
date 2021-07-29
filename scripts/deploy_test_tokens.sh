#!/usr/bin/env bash

set -e

export DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
export $(grep -v '^#' $DIR/../.env | xargs)

: "${MAINNET_PRIVATE_KEY?Need to set MAINNET_PRIVATE_KEY}"
: "${MAINNET_ENDPOINT?Need to set MAINNET_ENDPOINT}"

: "${SCHAIN_PRIVATE_KEY?Need to set SCHAIN_PRIVATE_KEY}"
: "${SCHAIN_ENDPOINT?Need to set SCHAIN_ENDPOINT}"

export ADDRESS_MINT_TO=${ADDRESS_MINT_TO:-$MAINNET_ADDRESS}

TOKEN_MANAGER_ERC_20_ADDRESS=$(cat abis/proxySchain.json | jq -r ".token_manager_erc20_address")
TOKEN_MANAGER_ERC_721_ADDRESS=$(cat abis/proxySchain.json | jq -r ".token_manager_erc721_address")
SC_TOKEN_MINTERS="$TOKEN_MANAGER_ERC_20_ADDRESS,$TOKEN_MANAGER_ERC_721_ADDRESS"

cd $DIR/../test/test_tokens
NETWORK_NAME=mn TOKEN_MINTERS="" ENDPOINT=$MAINNET_ENDPOINT ETH_PRIVATE_KEY=$MAINNET_PRIVATE_KEY bash $DIR/deploy_tokens_to_network.sh
IS_SKIP_MINT=True NETWORK_NAME=sc TOKEN_MINTERS=$SC_TOKEN_MINTERS ENDPOINT=$SCHAIN_ENDPOINT ETH_PRIVATE_KEY=$SCHAIN_PRIVATE_KEY bash $DIR/deploy_tokens_to_network.sh

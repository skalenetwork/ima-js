#!/usr/bin/env bash

set -e

export DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
export $(grep -v '^#' $DIR/../.env | xargs)

: "${MAINNET_ADDRESS?Need to set MAINNET_ADDRESS}"
: "${MAINNET_PRIVATE_KEY?Need to set MAINNET_PRIVATE_KEY}"
: "${MAINNET_ENDPOINT?Need to set MAINNET_ENDPOINT}"

: "${SCHAIN_PRIVATE_KEY?Need to set SCHAIN_PRIVATE_KEY}"
: "${SCHAIN_ENDPOINT?Need to set SCHAIN_ENDPOINT}"

cd $DIR/../test-tokens
yarn install

export PRIVATE_KEY_FOR_ETHEREUM=$MAINNET_PRIVATE_KEY
export URL_W3_ETHEREUM=$MAINNET_ENDPOINT

export PRIVATE_KEY_FOR_SCHAIN=$SCHAIN_PRIVATE_KEY
export URL_W3_S_CHAIN=$SCHAIN_ENDPOINT

TOKEN_MANAGER_ERC_20_ADDRESS=$(cat $DIR/../abis/proxySchain.json | jq -r ".token_manager_erc20_address")
TOKEN_MANAGER_ERC_721_ADDRESS=$(cat $DIR/../abis/proxySchain.json | jq -r ".token_manager_erc721_address")

# ERC20

ERC20_TOKEN_NAME='SLCToken'
ERC20_TOKEN_SYMBOL='SLC'
MINT_AMOUNT='1000'

npx hardhat erc20 --name $ERC20_TOKEN_NAME --symbol $ERC20_TOKEN_SYMBOL --network mainnet
npx hardhat erc20 --name $ERC20_TOKEN_NAME --symbol $ERC20_TOKEN_SYMBOL --network schain

MAINNET_ERC_20_ADDRESS=$(cat $DIR/../test-tokens/data/ERC20Example-$ERC20_TOKEN_NAME-mainnet.json | jq -r ".erc20_address")
SCHAIN_ERC_20_ADDRESS=$(cat $DIR/../test-tokens/data/ERC20Example-$ERC20_TOKEN_NAME-schain.json | jq -r ".erc20_address")

npx hardhat add-minter-erc20 --token-address $SCHAIN_ERC_20_ADDRESS --address $TOKEN_MANAGER_ERC_20_ADDRESS --network schain
npx hardhat mint-erc20 --token-address $MAINNET_ERC_20_ADDRESS --receiver-address $MAINNET_ADDRESS --amount $MINT_AMOUNT --network mainnet

# ERC721

ERC721_TOKEN_NAME='SLCCollectible'
ERC721_TOKEN_SYMBOL='SLCCOL'

npx hardhat erc721 --name $ERC721_TOKEN_NAME --symbol $ERC721_TOKEN_SYMBOL --network mainnet
npx hardhat erc721 --name $ERC721_TOKEN_NAME --symbol $ERC721_TOKEN_SYMBOL --network schain

# MAINNET_ERC_721_ADDRESS=$(cat $DIR/../test-tokens/data/ERC20Example-$ERC20_TOKEN_NAME-mainnet.json | jq -r ".erc20_address")
# SCHAIN_ERC_721_ADDRESS=$(cat $DIR/../test-tokens/data/ERC20Example-$ERC20_TOKEN_NAME-schain.json | jq -r ".erc20_address")

# npx hardhat add-minter-erc721 --token-address $SCHAIN_ERC_20_ADDRESS --address $TOKEN_MANAGER_ERC_721_ADDRESS --network schain
# npx hardhat mint-erc721 --token-address $MAINNET_ERC_20_ADDRESS --receiver-address $MAINNET_ADDRESS --amount $MINT_AMOUNT --network mainnet


### OLD!

# export ADDRESS_MINT_TO=${ADDRESS_MINT_TO:-$MAINNET_ADDRESS}

# TOKEN_MANAGER_ERC_20_ADDRESS=$(cat abis/proxySchain.json | jq -r ".token_manager_erc20_address")
# TOKEN_MANAGER_ERC_721_ADDRESS=$(cat abis/proxySchain.json | jq -r ".token_manager_erc721_address")
# SC_TOKEN_MINTERS="$TOKEN_MANAGER_ERC_20_ADDRESS,$TOKEN_MANAGER_ERC_721_ADDRESS"

# cd $DIR/../test/test_tokens
# NETWORK_NAME=mn TOKEN_MINTERS="" ENDPOINT=$MAINNET_ENDPOINT ETH_PRIVATE_KEY=$MAINNET_PRIVATE_KEY bash $DIR/deploy_tokens_to_network.sh
# IS_SKIP_MINT=True NETWORK_NAME=sc TOKEN_MINTERS=$SC_TOKEN_MINTERS ENDPOINT=$SCHAIN_ENDPOINT ETH_PRIVATE_KEY=$SCHAIN_PRIVATE_KEY bash $DIR/deploy_tokens_to_network.sh

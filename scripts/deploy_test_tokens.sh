#!/usr/bin/env bash

set -e

export DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

bash $DIR/deploy_erc20.sh
bash $DIR/deploy_erc721.sh
bash $DIR/deploy_erc1155.sh

/**
 * @license
 * SKALE ima-js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * @file MainnetChain.ts
 * @copyright SKALE Labs 2021-Present
 */

import Web3 from 'web3';

import { BaseChain } from './BaseChain';

import { DepositBoxEth } from './contracts/mainnet/DepositBoxEth';
import { DepositBoxERC20 } from './contracts/mainnet/DepositBoxERC20';
import { DepositBoxERC721 } from './contracts/mainnet/DepositBoxERC721';
import { DepositBoxERC1155 } from './contracts/mainnet/DepositBoxERC1155';

import { CommunityPool } from './contracts/mainnet/CommunityPool';
import { Linker } from './contracts/mainnet/Linker';

import { MessageProxy } from './contracts/MessageProxy';


export default class MainnetChain extends BaseChain {

    eth: DepositBoxEth;
    erc20: DepositBoxERC20;
    erc721: DepositBoxERC721;
    erc721meta: DepositBoxERC721;
    erc1155: DepositBoxERC1155;

    communityPool: CommunityPool;
    linker: Linker;
    messageProxyMainnet: MessageProxy;

    constructor(web3: Web3, abi: any, chainId?: number) {
        super(web3, abi, chainId);
        this.eth = new DepositBoxEth(
            this.web3,
            this.abi.deposit_box_eth_address,
            this.abi.deposit_box_eth_abi
        )
        this.erc20 = new DepositBoxERC20(
            this.web3,
            this.abi.deposit_box_erc20_address,
            this.abi.deposit_box_erc20_abi
        )
        this.erc721 = new DepositBoxERC721(
            this.web3,
            this.abi.deposit_box_erc721_address,
            this.abi.deposit_box_erc721_abi
        )
        this.erc721meta = new DepositBoxERC721(
            this.web3,
            this.abi.deposit_box_erc721_with_metadata_address,
            this.abi.deposit_box_erc721_with_metadata_abi
        )
        this.erc1155 = new DepositBoxERC1155(
            this.web3,
            this.abi.deposit_box_erc1155_address,
            this.abi.deposit_box_erc1155_abi
        )

        this.communityPool = new CommunityPool(
            this.web3,
            this.abi.community_pool_address,
            this.abi.community_pool_abi
        )
        this.linker = new Linker(
            this.web3,
            this.abi.linker_address,
            this.abi.linker_abi
        )
        this.messageProxyMainnet = new MessageProxy(
            this.web3,
            this.abi.message_proxy_mainnet_address,
            this.abi.message_proxy_mainnet_abi
        )
    }

    async ethBalance(address: string): Promise<string> {
        return await this.web3.eth.getBalance(address);
    }

}
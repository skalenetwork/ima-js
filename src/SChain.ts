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
 * @file SChain.ts
 * @copyright SKALE Labs 2021-Present
 */

import Web3 from 'web3';

import { BaseChain } from './BaseChain';

import { BaseContract } from './contracts/BaseContract';
import { TokenManagerEth } from './contracts/schain/TokenManagerEth';
import { TokenManagerERC20 } from './contracts/schain/TokenManagerERC20';
import { TokenManagerERC721 } from './contracts/schain/TokenManagerERC721';
import { TokenManagerERC1155 } from './contracts/schain/TokenManagerERC1155';

import { EthERC20 } from './contracts/schain/EthERC20';
import { СommunityLocker } from './contracts/schain/СommunityLocker';
import { TokenManagerLinker } from './contracts/schain/TokenManagerLinker';
import { MessageProxyChain } from './contracts/schain/MessageProxyChain';


export default class SChain extends BaseChain {

    eth: TokenManagerEth;
    erc20: TokenManagerERC20;
    erc721: TokenManagerERC721;
    erc721meta: TokenManagerERC721;
    erc1155: TokenManagerERC1155;

    ethERC20: EthERC20;
    communityLocker: СommunityLocker;
    tokenManagerLinker: TokenManagerLinker;
    messageProxyChain: MessageProxyChain;

    constructor(web3: Web3, abi: any, chainId?: number) {
        super(web3, abi, chainId);
        this.eth = new TokenManagerEth(
            this.web3,
            this.abi.token_manager_eth_address,
            this.abi.token_manager_eth_abi
        )
        this.erc20 = new TokenManagerERC20(
            this.web3,
            this.abi.token_manager_erc20_address,
            this.abi.token_manager_erc20_abi
        )
        this.erc721 = new TokenManagerERC721(
            this.web3,
            this.abi.token_manager_erc721_address,
            this.abi.token_manager_erc721_abi
        )
        this.erc721meta = new TokenManagerERC721(
            this.web3,
            this.abi.token_manager_erc721_with_metadata_address,
            this.abi.token_manager_erc721_with_metadata_abi
        )
        this.erc1155 = new TokenManagerERC1155(
            this.web3,
            this.abi.token_manager_erc1155_address,
            this.abi.token_manager_erc1155_abi
        )

        this.ethERC20 = new EthERC20(
            this.web3,
            this.abi.eth_erc20_address,
            this.abi.eth_erc20_abi
        )
        this.communityLocker = new СommunityLocker(
            this.web3,
            this.abi.community_locker_address,
            this.abi.community_locker_abi
        )
        this.tokenManagerLinker = new TokenManagerLinker(
            this.web3,
            this.abi.token_manager_linker_address,
            this.abi.token_manager_linker_abi
        )
        this.messageProxyChain = new MessageProxyChain(
            this.web3,
            this.abi.message_proxy_chain_address,
            this.abi.message_proxy_chain_abi
        )
    }

    async ethBalance(address: string): Promise<string> {
        return await this.ethERC20.balanceOf(address);
    }

}
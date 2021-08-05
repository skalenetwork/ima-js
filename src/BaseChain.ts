/**
 * @license
 * SKALE ima-js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * @file BaseChain.ts
 * @copyright SKALE Labs 2021-Present
 */

import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';

import * as constants from './constants';


export interface ContractsStringMap { [key: string]: Contract; }

export abstract class BaseChain {
    readonly web3: Web3;
    chainId?: number;
    abi: any;
    contracts: ContractsStringMap;
    ERC20tokens: ContractsStringMap;
    ERC721tokens: ContractsStringMap;
    ERC1155tokens: ContractsStringMap;

    constructor(web3: Web3, abi: any, chainId?: number) {
        this.web3 = web3;
        this.abi = abi;
        this.ERC20tokens = {};
        this.ERC721tokens = {};
        this.ERC1155tokens = {};
        if (chainId) this.chainId = chainId;
        this.contracts = this.initContracts();
    }

    abstract ethBalance(address: string): Promise<string>;
    abstract initContracts(): ContractsStringMap;

    addERC20Token(tokenName: string, contract: Contract) {
        this.ERC20tokens[tokenName] = contract;
    }

    addERC721Token(tokenName: string, contract: Contract) {
        this.ERC721tokens[tokenName] = contract;
    }

    addERC1155Token(tokenName: string, contract: Contract) {
        this.ERC1155tokens[tokenName] = contract;
    }

    listERC20Tokens() {
        return Object.keys(this.ERC20tokens);
    }

    listERC721Tokens() {
        return Object.keys(this.ERC721tokens);
    }

    listERC1155Tokens() {
        return Object.keys(this.ERC1155tokens);
    }

    async getERC20Balance(tokenName: string, address: string): Promise<string> {
        const contract = this.ERC20tokens[tokenName];
        return await contract.methods.balanceOf(address).call({from: address});
    }

    async getERC721OwnerOf(tokenName: string, tokenId: number): Promise<string> {
        const contract = this.ERC721tokens[tokenName];
        try {
            return await contract.methods.ownerOf(tokenId).call();
        } catch (err) {
            return constants.ZERO_ADDRESS; // todo: replace with IMA-ERC721 exception: no such token
        }
    }

    async getERC1155Balance(tokenName: string, address: string, tokenId: number): Promise<string> {
        const contract = this.ERC1155tokens[tokenName];
        return await contract.methods.balanceOf(address, tokenId).call({from: address});
    }
}

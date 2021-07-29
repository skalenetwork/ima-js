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


export interface ContractsStringMap { [key: string]: Contract; }

export abstract class BaseChain {
    readonly web3: Web3;
    chainId?: number;
    abi: any;
    contracts: ContractsStringMap;
    ERC20tokens: ContractsStringMap;
    ERC721tokens: ContractsStringMap;

    constructor(web3: Web3, abi: any, chainId?: number) {
        this.web3 = web3;
        this.abi = abi;
        this.ERC20tokens = {};
        this.ERC721tokens = {};
        if (chainId) this.chainId = chainId;
        this.contracts = this.initContracts();
    }

    abstract ethBalance(address: string): Promise<string>;
    abstract initContracts(): ContractsStringMap;
    // abstract getERC20balance(tokenName: string, address: string): Promise<string>;

    addERC20token(tokenName: string, contract: Contract) {
        this.ERC20tokens[tokenName] = contract;
    }

    addERC721token(tokenName: string, contract: Contract) {
        this.ERC721tokens[tokenName] = contract;
    }

    listERC20tokens() {
        return Object.keys(this.ERC20tokens);
    }

    listERC721tokens() {
        return Object.keys(this.ERC721tokens);
    }

    async getERC20balance(tokenName: string, address: string): Promise<string> {
        const contract = this.ERC20tokens[tokenName];
        return await contract.methods.balanceOf(address).call({from: address});
    }
}

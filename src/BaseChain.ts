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
 * @file BaseChain.ts
 * @copyright SKALE Labs 2021-Present
 */

import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { Logger } from "tslog";

import * as constants from './constants';
import * as helper from './helper';


const log: Logger = new Logger();

export interface ContractsStringMap { [key: string]: Contract; }

export abstract class BaseChain {
    readonly web3: Web3;
    chainId?: number;
    abi: any;
    contracts: ContractsStringMap;
    ERC20tokens: ContractsStringMap;
    ERC721tokens: ContractsStringMap;
    ERC721WithMetadataTokens: ContractsStringMap;
    ERC1155tokens: ContractsStringMap;

    constructor(web3: Web3, abi: any, chainId?: number) {
        this.web3 = web3;
        this.abi = abi;
        this.ERC20tokens = {};
        this.ERC721tokens = {};
        this.ERC721WithMetadataTokens = {};
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

    addERC721WithMetadataToken(tokenName: string, contract: Contract) {
        this.ERC721WithMetadataTokens[tokenName] = contract;
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

    async getERC721OwnerOf(tokenName: string, tokenId: number | string): Promise<string> {
        const contract = this.ERC721tokens[tokenName];
        try {
            if (typeof tokenId === 'string') tokenId = Number(tokenId);
            return await contract.methods.ownerOf(tokenId).call();
        } catch (err) {
            return constants.ZERO_ADDRESS; // todo: replace with IMA-ERC721 exception: no such token
        }
    }

    async getERC1155Balance(tokenName: string, address: string, tokenId: number): Promise<string> {
        const contract = this.ERC1155tokens[tokenName];
        return await contract.methods.balanceOf(address, tokenId).call({from: address});
    }

    async waitETHBalanceChange(address: string, initial: string,
        sleepInterval: number=constants.DEFAULT_SLEEP,
        iterations: number = constants.DEFAULT_ITERATIONS) {
        for (let i = 1; i <= iterations; i++) {
            let res;
            res = await this.ethBalance(address);
            if (initial !== res) {
                break;
            }
            if (helper.isNode()){
                log.info('Waiting for ETH balance change - address: ' + address +
                    ', sleeping for ' + sleepInterval + 'ms');
            }
            await helper.sleep(sleepInterval);
        }
    }

    async waitForChange(tokenName: string, getFunc: any, address: string | undefined,
        initial: string, tokenId: number | undefined, sleepInterval: number=constants.DEFAULT_SLEEP,
        iterations: number = constants.DEFAULT_ITERATIONS) {
        for (let i = 1; i <= iterations; i++) {
            let res;
            if (tokenId === undefined) res = await getFunc(tokenName, address);
            if (address === undefined) res = await getFunc(tokenName, tokenId);
            if (tokenId !== undefined && address !== undefined) {
                res = await getFunc(tokenName, address, tokenId);
            }
            if (initial !== res) {
                break;
            }
            if (helper.isNode()){
                log.info('Waiting for change - ' + tokenName + ' - address: ' + address +
                    ', sleeping for ' + sleepInterval + 'ms');
            }
            await helper.sleep(sleepInterval);
        }
    }

    async waitERC20BalanceChange(tokenName: string, address: string, initialBalance: string,
        sleepInterval: number=constants.DEFAULT_SLEEP): Promise<any> {
        await this.waitForChange(
            tokenName, this.getERC20Balance.bind(this), address, initialBalance, undefined,
            sleepInterval);
    }

    async waitERC721OwnerChange(tokenName: string, tokenId: number, initialOwner: string,
        sleepInterval: number=constants.DEFAULT_SLEEP): Promise<any> {
        await this.waitForChange(
            tokenName, this.getERC721OwnerOf.bind(this), undefined, initialOwner, tokenId,
            sleepInterval);
    }

    async waitERC1155BalanceChange(tokenName: string, address: string, tokenId: number,
        initialBalance: string, sleepInterval: number=constants.DEFAULT_SLEEP): Promise<any> {
        await this.waitForChange(
            tokenName, this.getERC1155Balance.bind(this), address, initialBalance, tokenId,
            sleepInterval);
    }
}

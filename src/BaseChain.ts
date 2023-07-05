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

import { Provider, TransactionResponse, Contract } from "ethers";

import debug from 'debug';

import * as transactions from './transactions';
import TxOpts from './TxOpts';
import TimeoutException from './exceptions/TimeoutException';
import * as constants from './constants';
import * as helper from './helper';


const log = debug('ima:BaseChain');


export interface ContractsStringMap { [key: string]: Contract; }

export abstract class BaseChain {
    provider: Provider;
    chainId?: number;
    abi: any;

    constructor(provider: Provider, abi: any, chainId?: number) {
        this.provider = provider;
        this.abi = abi;
        if (chainId) this.chainId = chainId;
    }

    abstract ethBalance(address: string): any;

    async getERC20Balance(tokenContract: Contract, address: string): Promise<bigint> {
        return await tokenContract.balanceOf(address);
    }

    async getERC721OwnerOf(tokenContract: Contract, tokenId: number | string): Promise<string> {
        try {
            if (typeof tokenId === 'string') tokenId = Number(tokenId);
            return await tokenContract.ownerOf(tokenId);
        } catch (err) {
            return constants.ZERO_ADDRESS; // todo: replace with IMA-ERC721 exception: no such token
        }
    }

    async getERC1155Balance(
        tokenContract: Contract,
        address: string,
        tokenId: number
    ): Promise<bigint> {
        return await tokenContract.balanceOf(address, tokenId);
    }

    async setTokenURI(
        tokenContract: Contract,
        tokenId: number,
        tokenURI: string,
        opts: TxOpts
    ): Promise<TransactionResponse> {
        const txData = await tokenContract.setTokenURI.populateTransaction(tokenId, tokenURI);
        return await transactions.send(this.provider, txData, opts, 'TokenContract::setTokenURI');
    }

    async waitETHBalanceChange(address: string, initial: bigint,
        sleepInterval: number = constants.DEFAULT_SLEEP,
        iterations: number = constants.DEFAULT_ITERATIONS) {
        for (let i = 1; i <= iterations; i++) {
            let res;
            res = await this.ethBalance(address);
            if (initial !== res) {
                break;
            }
            log('🔎 ' + i + '/' + iterations + ' Waiting for ETH balance change - address: ' +
                address + ', sleep: ' + sleepInterval + 'ms, initial: ' + initial + ', current: ' +
                res);
            await helper.sleep(sleepInterval);
        }
    }

    async waitForChange(
        tokenContract: Contract,
        getFunc: any,
        address: string | undefined,
        initial: string | bigint,
        tokenId: number | undefined,
        sleepInterval: number = constants.DEFAULT_SLEEP,
        iterations: number = constants.DEFAULT_ITERATIONS
    ) {
        const logData = 'token: ' + await tokenContract.getAddress() + ', address: ' + address;
        for (let i = 1; i <= iterations; i++) {
            let res;
            if (tokenId === undefined) res = await getFunc(tokenContract, address);
            if (address === undefined) res = await getFunc(tokenContract, tokenId);
            if (tokenId !== undefined && address !== undefined) {
                res = await getFunc(tokenContract, address, tokenId);
            }
            if (initial !== res) {
                return;
            }
            log('🔎 ' + i + '/' + iterations + ' Waiting for change - ' + logData +
                ', sleep ' + sleepInterval + 'ms');
            await helper.sleep(sleepInterval);
        }
        throw new TimeoutException('waitForTokenClone timeout - ' + logData);
    }

    async waitERC20BalanceChange(
        tokenContract: Contract,
        address: string,
        initialBalance: bigint,
        sleepInterval: number = constants.DEFAULT_SLEEP
    ): Promise<any> {
        await this.waitForChange(
            tokenContract, this.getERC20Balance.bind(this), address, initialBalance, undefined,
            sleepInterval);
    }

    async waitERC721OwnerChange(tokenContract: Contract, tokenId: number, initialOwner: string,
        sleepInterval: number = constants.DEFAULT_SLEEP): Promise<any> {
        await this.waitForChange(
            tokenContract, this.getERC721OwnerOf.bind(this), undefined, initialOwner, tokenId,
            sleepInterval);
    }

    async waitERC1155BalanceChange(tokenContract: Contract, address: string, tokenId: number,
        initialBalance: bigint, sleepInterval: number = constants.DEFAULT_SLEEP): Promise<any> {
        await this.waitForChange(
            tokenContract, this.getERC1155Balance.bind(this), address, initialBalance, tokenId,
            sleepInterval);
    }
}

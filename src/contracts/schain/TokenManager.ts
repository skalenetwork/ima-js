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
 * @file TokenManager.ts
 * @copyright SKALE Labs 2022-Present
 */

import debug from 'debug';
import { ethers, Contract, TransactionResponse } from 'ethers';

import { BaseContract } from '../BaseContract';
import { ContractsStringMap } from '../../BaseChain';
import TxOpts from '../../TxOpts';
import TimeoutException from '../../exceptions/TimeoutException';

import * as constants from '../../constants';
import * as transactions from '../../transactions';
import * as helper from '../../helper';


export abstract class TokenManager extends BaseContract {
    abstract tokenMappingLenghtSlot: number | null;
    tokens: ContractsStringMap = {};

    addToken(tokenName: string, contract: Contract) {
        this.tokens[tokenName] = contract;
    }

    abstract getTokenCloneAddress(
        originTokenAddress: string,
        originChainName: string
    ): Promise<string>;

    async enableAutomaticDeploy(opts: TxOpts): Promise<TransactionResponse> {
        const txData = await this.contract.enableAutomaticDeploy.populateTransaction();
        return await transactions.send(
            this.provider,
            txData,
            opts,
            this.txName('enableAutomaticDeploy')
        );
    }

    async disableAutomaticDeploy(opts: TxOpts): Promise<TransactionResponse> {
        const txData = await this.contract.disableAutomaticDeploy.populateTransaction();
        return await transactions.send(
            this.provider,
            txData,
            opts,
            this.txName('disableAutomaticDeploy')
        );
    }

    async automaticDeploy(): Promise<string> {
        return await this.contract.automaticDeploy();
    }

    async grantRole(
        role: any,
        address: string,
        opts: TxOpts
    ): Promise<TransactionResponse> {
        const txData = await this.contract.grantRole.populateTransaction(role, address);
        return await transactions.send(this.provider, txData, opts, this.txName('grantRole'));
    }

    async AUTOMATIC_DEPLOY_ROLE(): Promise<string> {
        return await this.contract.AUTOMATIC_DEPLOY_ROLE();
    }

    async TOKEN_REGISTRAR_ROLE(): Promise<string> {
        return await this.contract.TOKEN_REGISTRAR_ROLE();
    }

    async hasTokenManager(chainName: string): Promise<boolean> {
        return await this.contract.hasTokenManager(chainName);
    }

    async ownerOf(tokenName: string, tokenId: number | string): Promise<string> {
        const contract = this.tokens[tokenName];
        try {
            if (typeof tokenId === 'string') tokenId = Number(tokenId);
            return await contract.ownerOf(tokenId);
        } catch (err) {
            return constants.ZERO_ADDRESS; // todo: replace with IMA-ERC721 exception: no such token
        }
    }

    async waitForTokenClone(
        originTokenAddress: string,
        originChainName: string,
        sleepInterval: number = constants.DEFAULT_SLEEP,
        iterations: number = constants.DEFAULT_ITERATIONS
    ): Promise<any> {
        let address;
        const logData = 'origin token: ' + originTokenAddress + ' origin chain: ' + originChainName;
        for (let i = 1; i <= iterations; i++) {
            address = await this.getTokenCloneAddress(originTokenAddress, originChainName);
            if (constants.ZERO_ADDRESS !== address) {
                return address;
            }
            debug('Waiting for token clone - ' + logData);
            await helper.sleep(sleepInterval);
        }
        throw new TimeoutException('waitForTokenClone timeout - ' + logData);
    }

    /**
     * Returns the solidityPackedKeccak256 hash of a concatenation of the chainHash and the
     * tokenMappingLenghtSlot. Internal function.
     * @param {string} chainName - The name of the chain to use in the hash.
     * @returns {string} - The resulting hash.
     */
    _getMappingLengthSlot(chainName: string): string {
        const chainHash = ethers.id(chainName);
        return ethers.solidityPackedKeccak256(
            ["bytes32", "uint256"],
            [chainHash, this.tokenMappingLenghtSlot]
        );
    }

    /**
     * Returns the number of token mappings for a given chain name by reading the storage at the
     * corresponding mapping length slot.
     * @param {string} chainName - The name of the chain for which to get the token mapping length.
     * @returns {Promise<number>} - The number of token mappings.
     */
    async getTokenMappingsLength(chainName: string): Promise<number> {
        const length = await this.provider.getStorage(
            this.address,
            this._getMappingLengthSlot(chainName)
        );
        return parseInt(length, 16);
    }

    /**
     * Fetches an array of token addresses mapped to a specific chain.
     *
     * @param chainName The name of the chain to fetch token addresses for.
     * @param from The starting index in the token mapping.
     * @param to The ending index in the token mapping.
     * @returns A Promise that resolves to an array of token addresses.
     */
    async getTokenMappings(
        chainName: string,
        from: number,
        to: number
    ): Promise<string[]> {
        const getAddressPromises = Array.from(
            { length: to - from },
            (_, i) => this.getMappedTokenAddress(chainName, from + i)
        );
        return await Promise.all(getAddressPromises);
    }

    /**
     * Fetches a token address mapped to a specific chain at the given index.
     *
     * @param chainName The name of the chain to fetch the token address for.
     * @param index The index in the token mapping.
     * @returns A Promise that resolves to the token address.
     */
    private async getMappedTokenAddress(chainName: string, index: number): Promise<string> {
        const encoded = BigInt(
            ethers.solidityPackedKeccak256(["bytes32"],
                [this._getMappingLengthSlot(chainName)]));
        const addressSlot = (encoded + BigInt(index)).toString(16);
        const addressData = await this.provider.getStorage(this.address, addressSlot);
        // const addressRaw = ethers.hexStripZeros(addressData);
        return ethers.zeroPadValue(addressData, constants.ADDRESS_LENGTH_BYTES);
    }
}

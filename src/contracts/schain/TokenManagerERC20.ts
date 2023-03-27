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
 * @file TokenManagerERC20.ts
 * @copyright SKALE Labs 2022-Present
 */

import { providers, ethers, BigNumberish } from 'ethers';

import { TokenManager } from './TokenManager';
import * as constants from '../../constants';
import * as transactions from '../../transactions';
import TxOpts from '../../TxOpts';


export class TokenManagerERC20 extends TokenManager {

    async addTokenByOwner(
        originChainName: string,
        erc20OnMainnet: string,
        erc20OnSchain: string,
        opts: TxOpts
    ): Promise<providers.TransactionResponse> {
        const txData = await this.contract.populateTransaction.addERC20TokenByOwner(
            originChainName,
            erc20OnMainnet,
            erc20OnSchain
        );
        return await transactions.send(
            this.provider,
            txData,
            opts,
            this.txName('addERC20TokenByOwner')
        );
    }

    async getTokenCloneAddress(
        originTokenAddress: string,
        originChainName: string = constants.MAINNET_CHAIN_NAME
    ) {
        return await this.contract.clonesErc20(
            ethers.utils.solidityKeccak256(['string'], [originChainName]),
            originTokenAddress
        );
    }

    async approve(
        tokenName: string,
        amount: string,
        address: string,
        opts: TxOpts
    ): Promise<providers.TransactionResponse> {
        const tokenContract = this.tokens[tokenName];
        const txData = await tokenContract.populateTransaction.approve(address, amount);
        return await transactions.send(this.provider, txData, opts, this.txName('approve'));
    }

    async wrap(
        tokenName: string,
        amount: string,
        opts: TxOpts
    ): Promise<providers.TransactionResponse> {
        const tokenContract = this.tokens[tokenName];
        const txData = await tokenContract.populateTransaction.depositFor(opts.address, amount);
        return await transactions.send(this.provider, txData, opts, this.txName('depositFor'));
    }

    async unwrap(
        tokenName: string,
        amount: string,
        opts: TxOpts
    ): Promise<providers.TransactionResponse> {
        const tokenContract = this.tokens[tokenName];
        const txData = await tokenContract.populateTransaction.withdrawTo(opts.address, amount);
        return await transactions.send(this.provider, txData, opts, this.txName('withdrawTo'));
    }

    async withdraw(
        mainnetTokenAddress: string,
        amount: BigNumberish,
        opts: TxOpts
    ): Promise<providers.TransactionResponse> {
        const txData = await this.contract.populateTransaction.exitToMainERC20(
            mainnetTokenAddress,
            amount
        );
        return await transactions.send(this.provider, txData, opts, this.txName('exitToMainERC20'));
    }

    async transferToSchain(
        targetSchainName: string,
        mainnetTokenAddress: string,
        amount: string,
        opts: TxOpts
    ): Promise<providers.TransactionResponse> {
        const txData = await this.contract.populateTransaction.transferToSchainERC20(
            targetSchainName,
            mainnetTokenAddress,
            amount
        );
        return await transactions.send(
            this.provider,
            txData,
            opts,
            this.txName('transferToSchainERC20')
        );
    }

    /**
    Returns the solidityKeccak256 hash of a concatenation of the chainHash and the TOKEN_MANAGER_MAPPING_LENGTH_SLOT.
    Internal function.
    @param {string} chainName - The name of the chain to use in the hash.
    @returns {string} - The resulting hash.
    */
    _getMappingLengthSlot(chainName: string): string {
        const chainHash = ethers.utils.id(chainName);
        return ethers.utils.solidityKeccak256(
            ["bytes32", "uint256"],
            [chainHash, constants.TOKEN_MANAGER_MAPPING_LENGTH_SLOT]
        );
    }

    /**
    Returns the number of token mappings for a given chain name by reading the storage at the corresponding mapping length slot.
    @param {string} chainName - The name of the chain for which to get the token mapping length.
    @returns {Promise<number>} - The number of token mappings.
    */
    async getTokenMappingsLength(chainName: string): Promise<number> {
        const length = await this.provider.getStorageAt(
            this.address,
            this._getMappingLengthSlot(chainName)
        );
        return parseInt(length, 16);
    }

    /**
    Returns an array of Ethereum addresses representing the token mappings for a given chain name within a given range of indices.
    @param {string} chainName - The name of the chain for which to get the token mappings.
    @param {number} from - The starting index for the range of token mappings to retrieve.
    @param {number} to - The ending index for the range of token mappings to retrieve.
    @returns {Promise<string[]>} - An array of Ethereum addresses representing the token mappings.
    */
    async getTokenMappings(
        chainName: string,
        from: number,
        to: number
    ): Promise<string[]> {
        let addresses = [];
        for (let i = from; i < to; i++) {
            const addressSlotIt = ethers.BigNumber.from(
                ethers.utils.solidityKeccak256(["bytes32"], [this._getMappingLengthSlot(chainName)])
            ).add(i).toHexString();
            const addressData = await this.provider.getStorageAt(
                this.address, addressSlotIt
            );
            const addressRaw = ethers.utils.hexStripZeros(addressData);
            addresses.push(ethers.utils.hexZeroPad(addressRaw, 20));
        }
        return addresses;
    }
}

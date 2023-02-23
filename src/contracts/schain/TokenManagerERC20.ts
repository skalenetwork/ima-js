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

}

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
    ):
        Promise<any> {
        const txData = this.contract.methods.addERC20TokenByOwner(
            originChainName,
            erc20OnMainnet,
            erc20OnSchain
        );
        return await transactions.send(this.web3, txData, opts);
    }

    async getTokenCloneAddress(
        originTokenAddress: string,
        originChainName: string = constants.MAINNET_CHAIN_NAME
    ) {
        return await this.contract.methods.clonesErc20(
            this.web3.utils.soliditySha3(originChainName),
            originTokenAddress
        ).call();
    }

    async approve(tokenName: string, amount: string, address: string, opts: TxOpts): Promise<any> {
        const tokenContract = this.tokens[tokenName];
        const txData = tokenContract.methods.approve(address, amount);
        return await transactions.send(this.web3, txData, opts);
    }

    async wrap(tokenName: string, amount: string, opts: TxOpts): Promise<any> {
        const tokenContract = this.tokens[tokenName];
        const txData = tokenContract.methods.depositFor(opts.address, amount);
        return await transactions.send(this.web3, txData, opts);
    }

    async unwrap(tokenName: string, amount: string, opts: TxOpts): Promise<any> {
        const tokenContract = this.tokens[tokenName];
        const txData = tokenContract.methods.withdrawTo(opts.address, amount);
        return await transactions.send(this.web3, txData, opts);
    }

    /**
     * Funds an exit for the given token by sending a transaction.
     * @param tokenName - The name of the token for which the exit is to be funded.
     * @param opts - Transaction options including the value to be sent as part of the transaction.
     * @returns Promise<any> - The Promise that resolves to the transaction receipt.
     * @remarks
     * This is a payable transaction and the value should be passed in the opts object.
     * This function can be executed only for supported tokens.
     */
    async fundExit(tokenName: string, opts: TxOpts): Promise<any> {
        const tokenContract = this.tokens[tokenName];
        const txData = tokenContract.methods.fundExit();
        return await transactions.send(this.web3, txData, opts);
    }

    /**
     * Reverses a previously funded exit for the given token by sending a transaction.
     * @param tokenName - The name of the token for which the exit is to be undone.
     * @param opts - Transaction options.
     * @returns Promise<any> - The Promise that resolves to the transaction receipt.
     * @remarks
     * This function can be executed only for supported tokens.
     */
    async undoExit(tokenName: string, opts: TxOpts): Promise<any> {
        const tokenContract = this.tokens[tokenName];
        const txData = tokenContract.methods.undoExit();
        return await transactions.send(this.web3, txData, opts);
    }

    async withdraw(mainnetTokenAddress: string, amount: string, opts: TxOpts): Promise<any> {
        const txData = this.contract.methods.exitToMainERC20(
            mainnetTokenAddress,
            amount
        );
        return await transactions.send(this.web3, txData, opts);
    }

    async transferToSchain(
        targetSchainName: string,
        mainnetTokenAddress: string,
        amount: string,
        opts: TxOpts
    ): Promise<any> {
        const txData = this.contract.methods.transferToSchainERC20(
            targetSchainName,
            mainnetTokenAddress,
            amount
        );
        return await transactions.send(this.web3, txData, opts);
    }

}

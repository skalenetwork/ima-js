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
 * @file TokenManagerERC721.ts
 * @copyright SKALE Labs 2022-Present
 */

import { providers, ethers } from 'ethers';

import { TokenManager } from './TokenManager';
import * as constants from '../../constants';
import * as transactions from '../../transactions';
import TxOpts from '../../TxOpts';


export class TokenManagerERC721 extends TokenManager {

    async getTokenCloneAddress(
        originTokenAddress: string,
        originChainName: string = constants.MAINNET_CHAIN_NAME
    ): Promise<string> {
        return await this.contract.clonesErc721(
            ethers.utils.solidityKeccak256(['string'], [originChainName]),
            originTokenAddress
        );
    }

    async addTokenByOwner(
        originChainName: string,
        erc721OnMainnet: string,
        erc721OnSchain: string,
        opts: TxOpts
    ): Promise<providers.TransactionResponse> {
        const txData = await this.contract.populateTransaction.addERC721TokenByOwner(
            originChainName,
            erc721OnMainnet,
            erc721OnSchain
        );
        return await transactions.send(
            this.provider,
            txData,
            opts,
            this.txName('addERC721TokenByOwner')
        );
    }

    async approve(
        tokenName: string,
        tokenId: number,
        opts: TxOpts
    ): Promise<providers.TransactionResponse> {
        const tokenContract = this.tokens[tokenName];
        const txData = await tokenContract.populateTransaction.approve(this.address, tokenId);
        return await transactions.send(this.provider, txData, opts, this.txName('approve'));
    }

    async withdraw(
        mainnetTokenAddress: string,
        tokenId: number,
        opts: TxOpts
    ): Promise<providers.TransactionResponse> {
        const txData = await this.contract.populateTransaction.exitToMainERC721(
            mainnetTokenAddress,
            tokenId
        );
        return await transactions.send(
            this.provider,
            txData,
            opts,
            this.txName('exitToMainERC721')
        );
    }

    async transferToSchain(
        targetSchainName: string,
        tokenAddress: string,
        tokenId: number,
        opts: TxOpts
    ): Promise<providers.TransactionResponse> {
        const txData = await this.contract.populateTransaction.transferToSchainERC721(
            targetSchainName,
            tokenAddress,
            tokenId
        );
        return await transactions.send(
            this.provider,
            txData,
            opts,
            this.txName('transferToSchainERC721')
        );
    }

}

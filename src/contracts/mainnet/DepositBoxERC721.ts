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
 * @file DepositBoxERC721.ts
 * @copyright SKALE Labs 2022-Present
 */

import { TransactionResponse } from 'ethers';

import { DepositBox } from './DepositBox';
import * as transactions from '../../transactions';
import TxOpts from '../../TxOpts';


export class DepositBoxERC721 extends DepositBox {

    async approve(
        tokenName: string,
        tokenId: number,
        opts: TxOpts
    ): Promise<TransactionResponse> {
        const tokenContract = this.tokens[tokenName];
        const txData = await tokenContract.approve.populateTransaction(this.address, tokenId);
        return await transactions.send(this.provider, txData, opts, this.txName('approve'));
    }

    async deposit(
        chainName: string,
        tokenName: string,
        tokenId: number,
        opts: TxOpts
    ): Promise<TransactionResponse> {
        const tokenContract = this.tokens[tokenName];
        const tokenContractAddress = await tokenContract.getAddress();

        const txData = await this.contract.depositERC721.populateTransaction(
            chainName,
            tokenContractAddress,
            tokenId
        );
        return await transactions.send(this.provider, txData, opts, this.txName('depositERC721'));
    }

    async getTokenMappingsLength(chainName: string): Promise<number> {
        return await this.contract.getSchainToAllERC721Length(chainName);
    }

    async getTokenMappings(
        chainName: string,
        from: number,
        to: number
    ): Promise<string[]> {
        return await this.contract.getSchainToAllERC721(chainName, from, to);
    }

    async isTokenAdded(chainName: string, erc721OnMainnet: string) {
        return await this.contract.getSchainToERC721(chainName, erc721OnMainnet);
    }

    async addTokenByOwner(
        chainName: string,
        erc721OnMainnet: string,
        opts: TxOpts
    ): Promise<TransactionResponse> {
        const txData = await this.contract.addERC721TokenByOwner.populateTransaction(
            chainName,
            erc721OnMainnet
        );
        return await transactions.send(
            this.provider,
            txData,
            opts,
            this.txName('addERC721TokenByOwner')
        );
    }
}

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

import { providers, BigNumber, BigNumberish } from 'ethers';

import { DepositBox } from './DepositBox';
import * as transactions from '../../transactions';
import TxOpts from '../../TxOpts';


export class DepositBoxERC721 extends DepositBox {

    async approve(
        tokenName: string,
        tokenId: number,
        opts: TxOpts
    ): Promise<providers.TransactionResponse> {
        const tokenContract = this.tokens[tokenName];
        const txData = await tokenContract.populateTransaction.approve(this.address, tokenId);
        return await transactions.send(this.provider, txData, opts, this.txName('approve'));
    }

    async deposit(
        chainName: string,
        tokenName: string,
        tokenId: number,
        opts: TxOpts
    ): Promise<providers.TransactionResponse> {
        const tokenContract = this.tokens[tokenName];
        const tokenContractAddress = tokenContract.address;

        const txData = await this.contract.populateTransaction.depositERC721(
            chainName,
            tokenContractAddress,
            tokenId
        );
        return await transactions.send(this.provider, txData, opts, this.txName('depositERC721'));
    }

    async getTokenMappingsLength(chainName: string): Promise<BigNumber> {
        return await this.contract.getSchainToAllERC721Length(chainName);
    }

    async getTokenMappings(
        chainName: string,
        from: BigNumberish,
        to: BigNumberish
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
    ): Promise<providers.TransactionResponse> {
        const txData = await this.contract.populateTransaction.addERC721TokenByOwner(
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

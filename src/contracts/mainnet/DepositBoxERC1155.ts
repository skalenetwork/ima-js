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
 * @file DepositBoxERC1155.ts
 * @copyright SKALE Labs 2022-Present
 */

import { type TransactionResponse } from 'ethers';

import { DepositBox } from './DepositBox';
import * as transactions from '../../transactions';
import type TxOpts from '../../TxOpts';
import InvalidArgsException from '../../exceptions/InvalidArgsException';

export class DepositBoxERC1155 extends DepositBox {
    // todo: add approve single ERC1155!

    async approveAll (tokenName: string, opts: TxOpts): Promise<TransactionResponse> {
        const tokenContract = this.tokens[tokenName];
        const txData = await tokenContract.setApprovalForAll.populateTransaction(
            this.address,
            true
        );
        return await transactions.send(
            this.provider,
            txData,
            opts,
            this.txName('setApprovalForAll')
        );
    }

    async deposit (
        chainName: string,
        tokenName: string,
        tokenIds: number | number[],
        amounts: bigint | bigint[],
        opts: TxOpts
    ): Promise<TransactionResponse> {
        const tokenContract = this.tokens[tokenName];
        const tokenContractAddress = await tokenContract.getAddress();

        let txData: any;

        if (typeof tokenIds === 'number' && !(amounts instanceof Array)) {
            txData = await this.contract.depositERC1155.populateTransaction(
                chainName,
                tokenContractAddress,
                tokenIds,
                amounts
            );
        } else if (tokenIds instanceof Array && amounts instanceof Array) {
            txData = await this.contract.depositERC1155Batch.populateTransaction(
                chainName,
                tokenContractAddress,
                tokenIds,
                amounts
            );
        } else {
            throw new InvalidArgsException(
                'tokenIds and amounts should both be arrays of single objects');
        }
        return await transactions.send(this.provider, txData, opts, this.txName('depositERC1155'));
    }

    async getTokenMappingsLength (chainName: string): Promise<number> {
        return await this.contract.getSchainToAllERC1155Length(
            chainName);
    }

    async getTokenMappings (
        chainName: string,
        from: number,
        to: number
    ): Promise<string[]> {
        return await this.contract.getSchainToAllERC1155(
            chainName,
            from,
            to
        );
    }

    async isTokenAdded (chainName: string, erc1155OnMainnet: string): Promise<boolean> {
        return await this.contract.getSchainToERC1155(
            chainName, erc1155OnMainnet);
    }

    async addTokenByOwner (
        chainName: string,
        erc1155OnMainnet: string,
        opts: TxOpts
    ): Promise<TransactionResponse> {
        const txData = await this.contract.addERC1155TokenByOwner.populateTransaction(
            chainName,
            erc1155OnMainnet
        );
        return await transactions.send(
            this.provider,
            txData,
            opts,
            this.txName('addERC1155TokenByOwner')
        );
    }
}

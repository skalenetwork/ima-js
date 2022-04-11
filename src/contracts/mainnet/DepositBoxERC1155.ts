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

import { DepositBox } from './DepositBox';
import * as transactions from '../../transactions';
import TxOpts from '../../TxOpts';
import InvalidArgsException from '../../exceptions/InvalidArgsException';


export class DepositBoxERC1155 extends DepositBox {

    // todo: add approve single ERC1155!

    async approveAll(tokenName: string, opts: TxOpts): Promise<any> {
        const tokenContract = this.tokens[tokenName];
        const txData = tokenContract.methods.setApprovalForAll(this.address, true);
        return await transactions.send(this.web3, txData, opts);
    }

    async deposit(
        chainName: string, tokenName: string, tokenIds: number | number[],
        amounts: string | string[], opts: TxOpts):Promise<any> {
        const tokenContract = this.tokens[tokenName];
        const tokenContractAddress = tokenContract.options.address;

        let txData: any;

        if (typeof tokenIds === 'number' && typeof amounts === 'string') {
            txData = this.contract.methods.depositERC1155(
                chainName,
                tokenContractAddress,
                tokenIds,
                amounts
            );
        } else if (tokenIds instanceof Array && amounts instanceof Array) {
            txData = this.contract.methods.depositERC1155Batch(
                chainName,
                tokenContractAddress,
                tokenIds,
                amounts
            );
        } else {
            throw new InvalidArgsException(
                'tokenIds and amounts should both be arrays of single objects');
        }
        return await transactions.send(this.web3, txData, opts);
    }

    async getTokenMappingsLength(chainName: string): Promise<number> {
        return await this.contract.methods.getSchainToAllERC1155Length(
            chainName).call();
    }

    async getTokenMappings(
        chainName: string,
        from: number | string,
        to: number | string
    ): Promise<string[]> {
        return await this.contract.methods.getSchainToAllERC1155(
            chainName,
            from,
            to
        ).call();
    }

    async isTokenAdded(chainName: string, erc1155OnMainnet: string) {
        return await this.contract.methods.getSchainToERC1155(
            chainName, erc1155OnMainnet).call();
    }

    async addTokenByOwner(
        chainName: string,
        erc1155OnMainnet: string,
        opts: TxOpts
    ): Promise<any> {
        const txData = this.contract.methods.addERC1155TokenByOwner(
            chainName,
            erc1155OnMainnet
        );
        return await transactions.send(this.web3, txData, opts);
    }

}

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
 * @file TokenManagerERC1155.ts
 * @copyright SKALE Labs 2022-Present
 */

import { TokenManager } from './TokenManager';
import * as constants from '../../constants';
import * as transactions from '../../transactions';
import TxOpts from '../../TxOpts';
import InvalidArgsException from '../../exceptions/InvalidArgsException';


export class TokenManagerERC1155 extends TokenManager {

    async getTokenCloneAddress(
        originTokenAddress: string,
        originChainName: string = constants.MAINNET_CHAIN_NAME
    ) {
        return await this.contract.methods.clonesErc1155(
            this.web3.utils.soliditySha3(originChainName),
            originTokenAddress
        ).call();
    }

    async addTokenByOwner(
        originChainName: string,
        erc1155OnMainnet: string,
        erc1155OnSchain: string,
        opts: TxOpts
    ):
        Promise<any> {
        const txData = this.contract.methods.addERC1155TokenByOwner(
            originChainName,
            erc1155OnMainnet,
            erc1155OnSchain
        );
        return await transactions.send(this.web3, txData, opts);
    }

    async approveAll(tokenName: string, tokenId: number, opts: TxOpts): Promise<any> {
        const tokenContract = this.tokens[tokenName];
        const txData = tokenContract.methods.setApprovalForAll(this.address, tokenId);
        return await transactions.send(this.web3, txData, opts);
    }

    async withdraw(mainnetTokenAddress: string, tokenIds: number | number[],
        amounts: string | string[], opts: TxOpts): Promise<any> {
        let txData: any;

        if (typeof tokenIds === 'number' && typeof amounts === 'string') {
            txData = this.contract.methods.exitToMainERC1155(
                mainnetTokenAddress,
                tokenIds,
                amounts
            );
        } else if (tokenIds instanceof Array && amounts instanceof Array) {
            txData = this.contract.methods.exitToMainERC1155Batch(
                mainnetTokenAddress,
                tokenIds,
                amounts
            );
        } else {
            throw new InvalidArgsException(
                'tokenIds and amounts should both be arrays of single objects');
        }
        return await transactions.send(this.web3, txData, opts);
    }

    async transferToSchain(
        targetSchainName: string,
        tokenAddress: string,
        tokenIds: number | number[],
        amounts: string | string[],
        opts: TxOpts
    ): Promise<any> {
        let txData: any;
        if (typeof tokenIds === 'number' && typeof amounts === 'string') {
            txData = this.contract.methods.transferToSchainERC1155(
                targetSchainName,
                tokenAddress,
                tokenIds,
                amounts
            );
        } else if (tokenIds instanceof Array && amounts instanceof Array) {
            txData = this.contract.methods.transferToSchainERC1155Batch(
                targetSchainName,
                tokenAddress,
                tokenIds,
                amounts
            );
        } else {
            throw new InvalidArgsException(
                'tokenIds and amounts should both be arrays of single objects');
        }
        return await transactions.send(this.web3, txData, opts);
    }

}

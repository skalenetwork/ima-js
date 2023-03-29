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

import { providers, ethers, BigNumberish } from 'ethers';

import { TokenManager } from './TokenManager';
import * as constants from '../../constants';
import * as transactions from '../../transactions';
import TxOpts from '../../TxOpts';
import InvalidArgsException from '../../exceptions/InvalidArgsException';


export class TokenManagerERC1155 extends TokenManager {

    tokenMappingLenghtSlot = constants.TOKEN_MANAGER_ERC1155_MAPPING_LENGTH_SLOT;

    async getTokenCloneAddress(
        originTokenAddress: string,
        originChainName: string = constants.MAINNET_CHAIN_NAME
    ) {
        return await this.contract.clonesErc1155(
            ethers.utils.solidityKeccak256(['string'], [originChainName]),
            originTokenAddress
        );
    }

    async addTokenByOwner(
        originChainName: string,
        erc1155OnMainnet: string,
        erc1155OnSchain: string,
        opts: TxOpts
    ): Promise<providers.TransactionResponse> {
        const txData = await this.contract.populateTransaction.addERC1155TokenByOwner(
            originChainName,
            erc1155OnMainnet,
            erc1155OnSchain
        );
        return await transactions.send(
            this.provider,
            txData,
            opts,
            this.txName('addERC1155TokenByOwner')
        );
    }

    async approveAll(
        tokenName: string,
        tokenId: number,
        opts: TxOpts
    ): Promise<providers.TransactionResponse> {
        const tokenContract = this.tokens[tokenName];
        const txData = await tokenContract.populateTransaction.setApprovalForAll(
            this.address,
            tokenId
        );
        return await transactions.send(
            this.provider,
            txData,
            opts,
            this.txName('setApprovalForAll')
        );
    }

    async withdraw(
        mainnetTokenAddress: string,
        tokenIds: number | number[],
        amounts: BigNumberish | BigNumberish[],
        opts: TxOpts
    ): Promise<providers.TransactionResponse> {
        let txData: any;

        if (typeof tokenIds === 'number' && !(amounts instanceof Array)) {
            txData = await this.contract.populateTransaction.exitToMainERC1155(
                mainnetTokenAddress,
                tokenIds,
                amounts
            );
        } else if (tokenIds instanceof Array && amounts instanceof Array) {
            txData = await this.contract.populateTransaction.exitToMainERC1155Batch(
                mainnetTokenAddress,
                tokenIds,
                amounts
            );
        } else {
            throw new InvalidArgsException(
                'tokenIds and amounts should both be arrays of single objects');
        }
        return await transactions.send(
            this.provider,
            txData,
            opts,
            this.txName('exitToMainERC1155')
        );
    }

    async transferToSchain(
        targetSchainName: string,
        tokenAddress: string,
        tokenIds: number | number[],
        amounts: string | string[],
        opts: TxOpts
    ): Promise<providers.TransactionResponse> {
        let txData: any;
        if (typeof tokenIds === 'number' && !(amounts instanceof Array)) {
            txData = await this.contract.populateTransaction.transferToSchainERC1155(
                targetSchainName,
                tokenAddress,
                tokenIds,
                amounts
            );
        } else if (tokenIds instanceof Array && amounts instanceof Array) {
            txData = await this.contract.populateTransaction.transferToSchainERC1155Batch(
                targetSchainName,
                tokenAddress,
                tokenIds,
                amounts
            );
        } else {
            throw new InvalidArgsException(
                'tokenIds and amounts should both be arrays of single objects');
        }
        return await transactions.send(
            this.provider,
            txData,
            opts,
            this.txName('transferToSchainERC1155')
        );
    }

}

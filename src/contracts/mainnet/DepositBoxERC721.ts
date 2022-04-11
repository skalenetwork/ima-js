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

import { DepositBox } from './DepositBox';
import * as transactions from '../../transactions';
import TxOpts from '../../TxOpts';


export class DepositBoxERC721 extends DepositBox {

    async approve(tokenName: string, tokenId: number, opts: TxOpts): Promise<any> {
        const tokenContract = this.tokens[tokenName];
        const txData = tokenContract.methods.approve(this.address, tokenId);
        return await transactions.send(this.web3, txData, opts);
    }

    async deposit(
        chainName: string,
        tokenName: string,
        tokenId: number,
        opts: TxOpts
    ): Promise<any> {
        const tokenContract = this.tokens[tokenName];
        const tokenContractAddress = tokenContract.options.address;

        const txData = this.contract.methods.depositERC721(
            chainName,
            tokenContractAddress,
            tokenId
        );
        return await transactions.send(this.web3, txData, opts);
    }

    async getTokenMappingsLength(chainName: string): Promise<string> {
        return await this.contract.methods.getSchainToAllERC721Length(
            chainName).call();
    }

    async getTokenMappings(
        chainName: string,
        from: number | string,
        to: number | string
    ): Promise<string[]> {
        return await this.contract.methods.getSchainToAllERC721(chainName, from, to).call();
    }

    async isTokenAdded(chainName: string, erc721OnMainnet: string) {
        return await this.contract.methods.getSchainToERC721(
            chainName, erc721OnMainnet).call();
    }

    async addTokenByOwner(
        chainName: string,
        erc721OnMainnet: string,
        opts: TxOpts
    ): Promise<any> {
        const txData = this.contract.methods.addERC721TokenByOwner(
            chainName,
            erc721OnMainnet
        );
        return await transactions.send(this.web3, txData, opts);
    }
}

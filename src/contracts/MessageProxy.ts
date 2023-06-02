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
 * @file MessageProxy.ts
 * @copyright SKALE Labs 2022-Present
 */

import { TransactionResponse } from "ethers";

import { BaseContract } from './BaseContract';
import TxOpts from './../TxOpts';
import * as transactions from './../transactions';


export class MessageProxy extends BaseContract {

    async isChainConnected(chainName: string): Promise<boolean> {
        return await this.contract.isConnectedChain(chainName);
    }

    async CHAIN_CONNECTOR_ROLE(): Promise<string> {
        return await this.contract.CHAIN_CONNECTOR_ROLE();
    }

    async grantRole(
        role: any,
        address: string,
        opts: TxOpts
    ): Promise<TransactionResponse> {
        const txData = await this.contract.grantRole.populateTransaction(role, address);
        return await transactions.send(this.provider, txData, opts, this.txName('grantRole'));
    }

    async addConnectedChain(
        schainName: string,
        opts: TxOpts
    ): Promise<TransactionResponse> {
        const txData = await this.contract.addConnectedChain.populateTransaction(schainName);
        return await transactions.send(
            this.provider,
            txData,
            opts,
            this.txName('addConnectedChain')
        );
    }

}

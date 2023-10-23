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
 * @file CommunityPool.ts
 * @copyright SKALE Labs 2022-Present
 */

import { type TransactionResponse } from 'ethers';
import { BaseContract } from '../BaseContract';
import * as transactions from '../../transactions';
import type TxOpts from '../../TxOpts';

export class CommunityPool extends BaseContract {
    async balance (address: string, chainName: string): Promise<bigint> {
        return await this.contract.getBalance(address, chainName);
    }

    async recharge (
        chainName: string,
        address: string,
        opts: TxOpts
    ): Promise<TransactionResponse> {
        const txData = await this.contract.rechargeUserWallet.populateTransaction(
            chainName,
            address
        );
        return await transactions.send(this.provider, txData, opts, this.txName('recharge'));
    }

    async withdraw (
        chainName: string,
        withdrawAmountWei: bigint,
        opts: TxOpts
    ): Promise<TransactionResponse> {
        const txData = await this.contract.withdrawFunds.populateTransaction(
            chainName,
            withdrawAmountWei
        );
        return await transactions.send(this.provider, txData, opts, this.txName('withdraw'));
    }
}

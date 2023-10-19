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
 * @file DepositBoxEth.ts
 * @copyright SKALE Labs 2022-Present
 */

import { type TransactionResponse } from 'ethers';

import { Logger, type ILogObj } from 'tslog';

import { DepositBox } from './DepositBox';
import * as transactions from '../../transactions';
import type TxOpts from '../../TxOpts';

import * as constants from '../../constants';
import * as helper from '../../helper';

const log = new Logger<ILogObj>();

export class DepositBoxEth extends DepositBox {
    async deposit (
        chainName: string, opts: TxOpts): Promise<TransactionResponse> {
        const txData = await this.contract.deposit.populateTransaction(chainName);
        return await transactions.send(this.provider, txData, opts, this.txName('deposit'));
    }

    async getMyEth (opts: TxOpts): Promise<TransactionResponse> {
        const txData = await this.contract.getMyEth.populateTransaction();
        return await transactions.send(this.provider, txData, opts, this.txName('getMyEth'));
    }

    async lockedETHAmount (address: string): Promise<bigint> {
        return await this.contract.approveTransfers(address);
    }

    async waitLockedETHAmountChange (address: string, initial: bigint,
        sleepInterval: number = constants.DEFAULT_SLEEP,
        iterations: number = constants.DEFAULT_ITERATIONS): Promise<void> {
        for (let i = 1; i <= iterations; i++) {
            const res = await this.lockedETHAmount(address);
            if (initial !== res) {
                break;
            }
            log.info('🔎 ' + i.toString() + '/' + iterations.toString() + ' Waiting for locked ETH change - address: ' +
                address + ', sleep ' + sleepInterval.toString() + 'ms');
            await helper.sleep(sleepInterval);
        }
    }
}

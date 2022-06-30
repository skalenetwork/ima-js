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

import { DepositBox } from './DepositBox';
import * as transactions from '../../transactions';
import TxOpts from '../../TxOpts';

import * as constants from '../../constants';
import * as helper from '../../helper';


export class DepositBoxEth extends DepositBox {

    async deposit(
        chainName: string, opts: TxOpts): Promise<any> {
        const txData = this.contract.methods.deposit(chainName);
        return await transactions.send(this.web3, txData, opts);
    }

    async getMyEth(opts: TxOpts): Promise<any> {
        const txData = this.contract.methods.getMyEth();
        return await transactions.send(this.web3, txData, opts);
    }

    async lockedETHAmount(address: string): Promise<string> {
        return await this.contract.methods.approveTransfers(address).call( {
            from: address
        })
    }

    async waitLockedETHAmountChange(address: string, initial: string,
        sleepInterval: number=constants.DEFAULT_SLEEP,
        iterations: number = constants.DEFAULT_ITERATIONS) {
        for (let i = 1; i <= iterations; i++) {
            let res;
            res = await this.lockedETHAmount(address);
            if (initial !== res) {
                break;
            }
            if (helper.isNode()){
                // log.info('Waiting for locked ETH balance change - address: ' + address +
                //     ', sleeping for ' + sleepInterval + 'ms');
            }
            await helper.sleep(sleepInterval);
        }
    }

}

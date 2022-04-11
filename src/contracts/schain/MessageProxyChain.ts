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
 * @file MessageProxyChain.ts
 * @copyright SKALE Labs 2022-Present
 */

import { BaseContract } from '../BaseContract';
import * as transactions from '../../transactions';
import TxOpts from '../../TxOpts';


export class MessageProxyChain extends BaseContract {
   
    async addConnectedChain(schainName: string, opts: TxOpts): Promise<any> {
        const txData = this.contract.methods.addConnectedChain(schainName);
        return await transactions.send(this.web3, txData, opts);
    }

}

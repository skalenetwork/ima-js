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
 * @file BaseContract.ts
 * @copyright SKALE Labs 2021-Present
 */

import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';


export abstract class BaseContract {
    readonly web3: Web3;
    address: any;
    contract?: Contract;

    constructor(web3: Web3, address: string, abi: any) {
        this.web3 = web3;
        this.address = address;
        this.contract = new this.web3.eth.Contract(abi, address)
    }
}

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

import { ethers, Provider } from "ethers";
import debug from 'debug';


export class BaseContract {
    readonly provider: Provider;
    address: string;
    contract: ethers.Contract;
    name: string;

    constructor(provider: Provider, address: string, abi: any, name: string) {
        debug('Initing contract ' + this.constructor.name + ' at ' + address);
        this.provider = provider;
        this.address = address;
        this.contract = new ethers.Contract(address, abi, provider);
        this.name = name;
    }

    txName(funcName: string): string {
        return this.name + '::' + funcName;
    }
}

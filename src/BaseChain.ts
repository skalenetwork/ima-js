/**
 * @license
 * SKALE ima-js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * @file BaseChain.ts
 * @copyright SKALE Labs 2021-Present
 */

import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';


export interface ContractsStringMap { [key: string]: Contract; }

export abstract class BaseChain {
    readonly web3: Web3;
    chainId?: number;
    abi: any;
    contracts: ContractsStringMap;

    constructor(web3: Web3, abi: any, chainId?: number) {
        this.web3 = web3;
        this.abi = abi;
        if (chainId) this.chainId = chainId;
        this.contracts = this.initContracts();
    }

    abstract ethBalance(address: string): Promise<string>;
    abstract initContracts(): ContractsStringMap;

}

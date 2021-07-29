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
 * @file index.ts
 * @copyright SKALE Labs 2021-Present
 */

export { default as MainnetChain } from "./MainnetChain";
export { default as SChain } from "./SChain";

import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';

import MainnetChain from './MainnetChain';
import SChain from './SChain';

export default class IMA {
    mainnet: MainnetChain;
    schain: SChain;
    constructor(mainnetWeb3: Web3, sChainWeb3: Web3, mainnetAbi: any, sChainAbi: any) {
        this.mainnet = new MainnetChain(mainnetWeb3, mainnetAbi);
        this.schain = new SChain(sChainWeb3, sChainAbi);
    }

    addERC20token(tokenName: string, mainnetContract: Contract, sChainContact: Contract) {
        this.mainnet.addERC20token(tokenName, mainnetContract);
        this.schain.addERC20token(tokenName, sChainContact);
    }
}
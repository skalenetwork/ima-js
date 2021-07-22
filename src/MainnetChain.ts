/**
 * @license
 * SKALE ima-js-v2
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
 * @file MainnetChain.ts
 * @copyright SKALE Labs 2021-Present
 */

import { BaseChain, ContractsStringMap } from '../src/BaseChain';

class MainnetChain extends BaseChain {
    async ethBalance(address: string): Promise<string> {
        return await this.web3.eth.getBalance(address);
    }

    initContracts(): ContractsStringMap {
        return {
            'depositBoxEth': new this.web3.eth.Contract(
                this.abi.deposit_box_eth_abi,
                this.abi.deposit_box_eth_address
            )
        };
    }
    
    depositETHtoSChain(chainName: string, recipientAddress: string, weiValue: string): any {
        let method = this.contracts.depositBoxEth.methods.deposit(
            chainName,
            recipientAddress
        );
        let encodedTx = method.encodeABI();
        console.log(encodedTx);
        // let gasPrice = await transactionCustomizer.computeGasPrice( this.web3, 200000000000 );

    }
}

export default MainnetChain;

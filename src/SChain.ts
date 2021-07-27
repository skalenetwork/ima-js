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
 * @file SChain.ts
 * @copyright SKALE Labs 2021-Present
 */

import { BaseChain, ContractsStringMap } from './BaseChain';
import * as transactions from './transactions';


class SChain extends BaseChain {
    initContracts(): ContractsStringMap {
        return {
            'ethERC20': new this.web3.eth.Contract(
                this.abi.eth_erc20_abi,
                this.abi.eth_erc20_address
            ),
            'tokenManagerEth': new this.web3.eth.Contract(
                this.abi.token_manager_eth_abi,
                this.abi.token_manager_eth_address
            )
        };
    }

    async ethBalance(address: string): Promise<string> {
        return await this.contracts.ethERC20.methods.balanceOf(address).call({ from: address });
    }

    async withdrawETH(recipientAddress: string, weiValue: string,
        address: string, customGasLimit?: any, privateKey?: string): Promise<any> {
        const txData = this.contracts.tokenManagerEth.methods.exitToMain(
            recipientAddress, weiValue);
        return await transactions.send(
            this.web3, address, txData, weiValue, customGasLimit, privateKey);
    }

}

export default SChain;

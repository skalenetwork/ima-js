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
 * @file MainnetChain.ts
 * @copyright SKALE Labs 2021-Present
 */

import { BaseChain, ContractsStringMap } from './BaseChain';
import * as transactions from './transactions';
import TxOpts from './TxOpts';


class MainnetChain extends BaseChain {
    async ethBalance(address: string): Promise<string> {
        return await this.web3.eth.getBalance(address);
    }

    initContracts(): ContractsStringMap {
        return {
            'depositBoxEth': new this.web3.eth.Contract(
                this.abi.deposit_box_eth_abi,
                this.abi.deposit_box_eth_address
            ),
            'communityPool': new this.web3.eth.Contract(
                this.abi.community_pool_abi,
                this.abi.community_pool_address
            )
        };
    }

    async depositETHtoSChain(
        chainName: string, recipientAddress: string, opts: TxOpts): Promise<any> {
        const txData = this.contracts.depositBoxEth.methods.deposit(chainName, recipientAddress);
        return await transactions.send(this.web3, txData, opts);
    }

    async getMyEth(opts: TxOpts): Promise<any> {
        const txData = this.contracts.depositBoxEth.methods.getMyEth();
        return await transactions.send(this.web3, txData, opts);
    }

    async reimbursementWalletBalance(chainName: string, address: string): Promise<string> {
        return await this.contracts.communityPool.methods.getBalance(chainName).call( {
            from: address
        })
    }

    async lockedETHAmount(address: string): Promise<string> {
        return await this.contracts.depositBoxEth.methods.approveTransfers(address).call( {
            from: address
        })
    }

    async reimbursementWalletRecharge(chainName: string, opts: TxOpts): Promise<any> {
        const txData = this.contracts.communityPool.methods.rechargeUserWallet(chainName);
        return await transactions.send(this.web3, txData, opts);
    }

    async reimbursementWalletWithdraw(
        chainName: string, withdrawAmountWei: string, opts: TxOpts): Promise<any> {
        const txData = this.contracts.communityPool.methods.withdrawFunds(
            chainName, withdrawAmountWei);
        return await transactions.send(this.web3, txData, opts);
    }
}

export default MainnetChain;

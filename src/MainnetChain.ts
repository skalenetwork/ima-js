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
            'depositBoxERC20': new this.web3.eth.Contract(
                this.abi.deposit_box_erc20_abi,
                this.abi.deposit_box_erc20_address
            ),
            'depositBoxERC721': new this.web3.eth.Contract(
                this.abi.deposit_box_erc721_abi,
                this.abi.deposit_box_erc721_address
            ),
            'depositBoxERC1155': new this.web3.eth.Contract(
                this.abi.deposit_box_erc1155_abi,
                this.abi.deposit_box_erc1155_address
            ),
            'communityPool': new this.web3.eth.Contract(
                this.abi.community_pool_abi,
                this.abi.community_pool_address
            )
        };
    }

    // todo: split - eth

    async depositETHtoSChain(
        chainName: string, recipientAddress: string, opts: TxOpts): Promise<any> {
        const txData = this.contracts.depositBoxEth.methods.deposit(chainName, recipientAddress);
        return await transactions.send(this.web3, txData, opts);
    }

    async getMyEth(opts: TxOpts): Promise<any> {
        const txData = this.contracts.depositBoxEth.methods.getMyEth();
        return await transactions.send(this.web3, txData, opts);
    }

    // todo: split - reimbursement wallet

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

    // todo: split - erc20 transfers

    async approveERC20Transfers(tokenName: string, amount: string, opts: TxOpts): Promise<any> {
        const tokenContract = this.ERC20tokens[tokenName];
        const depositBoxAddress = this.contracts.depositBoxERC20.options.address;
        const txData = tokenContract.methods.approve(depositBoxAddress, amount);
        return await transactions.send(this.web3, txData, opts);
    }

    async depositERC20(chainName: string, tokenName: string, to: string, amount: string,
        opts: TxOpts): Promise<any> {
        const tokenContract = this.ERC20tokens[tokenName];
        const tokenContractAddress = tokenContract.options.address;

        const txData = this.contracts.depositBoxERC20.methods.depositERC20(
            chainName,
            tokenContractAddress,
            to,
            amount
        );
        return await transactions.send(this.web3, txData, opts);
    }

    // todo: split - erc721 transfers

    async approveERC721Transfer(tokenName: string, tokenId: number, opts: TxOpts): Promise<any> {
        const tokenContract = this.ERC721tokens[tokenName];
        const depositBoxAddress = this.contracts.depositBoxERC721.options.address;
        const txData = tokenContract.methods.approve(depositBoxAddress, tokenId);
        return await transactions.send(this.web3, txData, opts);
    }

    async depositERC721(chainName: string, tokenName: string, to: string, tokenId: number,
        opts: TxOpts): Promise<any> {
        const tokenContract = this.ERC721tokens[tokenName];
        const tokenContractAddress = tokenContract.options.address;

        const txData = this.contracts.depositBoxERC721.methods.depositERC721(
            chainName,
            tokenContractAddress,
            to,
            tokenId
        );
        return await transactions.send(this.web3, txData, opts);
    }

    // todo: split - erc1155 transfers

    async approveAllERC1155(tokenName: string, tokenId: number, opts: TxOpts): Promise<any> {
        const tokenContract = this.ERC1155tokens[tokenName];
        const depositBoxAddress = this.contracts.depositBoxERC1155.options.address;
        const txData = tokenContract.methods.setApprovalForAll(depositBoxAddress, true);
        return await transactions.send(this.web3, txData, opts);
    }

    async depositERC1155(
        chainName: string, tokenName: string, to: string, tokenIds: number | number[],
        amounts: string | string[], opts: TxOpts):Promise<any> {
        const tokenContract = this.ERC1155tokens[tokenName];
        const tokenContractAddress = tokenContract.options.address;

        const txData = this.contracts.depositBoxERC1155.methods.depositERC1155(
            chainName,
            tokenContractAddress,
            to,
            tokenIds,
            amounts
        );
        return await transactions.send(this.web3, txData, opts);
    }


    // todo: split - sChain owner admin functions

    async enableWhitelist(depositBoxContractName: string, chainName: string, opts: TxOpts):
        Promise<any> {
        const txData = this.contracts[depositBoxContractName].methods.enableWhitelist(chainName);
        return await transactions.send(this.web3, txData, opts);
    }

    async disableWhitelist(depositBoxContractName: string, chainName: string, opts: TxOpts):
        Promise<any> {
        const txData = this.contracts[depositBoxContractName].methods.disableWhitelist(chainName);
        return await transactions.send(this.web3, txData, opts);
    }

    async disableWhitelistERC20(chainName: string, opts: TxOpts): Promise<any> {
        return await this.disableWhitelist('depositBoxERC20', chainName, opts);
    }

    async disableWhitelistERC721(chainName: string, opts: TxOpts): Promise<any> {
        return await this.disableWhitelist('depositBoxERC721', chainName, opts);
    }

    async disableWhitelistERC1155(chainName: string, opts: TxOpts): Promise<any> {
        return await this.disableWhitelist('depositBoxERC1155', chainName, opts);
    }

    async isERC20Added(chainName: string, erc20OnMainnet: string) {
        const chainHash = this.web3.utils.soliditySha3(chainName);
        return await this.contracts.depositBoxERC20.methods.schainToERC20(
            chainHash, erc20OnMainnet).call();
    }

    async addERC20TokenByOwner(chainName: string, erc20OnMainnet: string, opts: TxOpts):
        Promise<any> {
        const txData = this.contracts.depositBoxERC20.methods.addERC20TokenByOwner(
            chainName,
            erc20OnMainnet
        );
        return await transactions.send(this.web3, txData, opts);
    }

    async addERC721TokenByOwner(chainName: string, erc721OnMainnet: string, opts: TxOpts):
        Promise<any> {
        const txData = this.contracts.depositBoxERC721.methods.addERC721TokenByOwner(
            chainName,
            erc721OnMainnet
        );
        return await transactions.send(this.web3, txData, opts);
    }

    async addERC1155TokenByOwner(chainName: string, erc1155OnMainnet: string, opts: TxOpts):
        Promise<any> {
        const txData = this.contracts.depositBoxERC1155.methods.addERC1155TokenByOwner(
            chainName,
            erc1155OnMainnet
        );
        return await transactions.send(this.web3, txData, opts);
    }
}

export default MainnetChain;

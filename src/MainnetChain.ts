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
 * @file MainnetChain.ts
 * @copyright SKALE Labs 2021-Present
 */

import { Logger } from "tslog";

import { BaseChain, ContractsStringMap } from './BaseChain';
import * as transactions from './transactions';
import TxOpts from './TxOpts';

import * as constants from './constants';
import * as helper from './helper';

import InvalidArgsException from './exceptions/InvalidArgsException';

const log: Logger = new Logger();


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
            'depositBoxERC721WithMetadata': new this.web3.eth.Contract(
                this.abi.deposit_box_erc721_with_metadata_abi,
                this.abi.deposit_box_erc721_with_metadata_address
            ),
            'depositBoxERC1155': new this.web3.eth.Contract(
                this.abi.deposit_box_erc1155_abi,
                this.abi.deposit_box_erc1155_address
            ),
            'communityPool': new this.web3.eth.Contract(
                this.abi.community_pool_abi,
                this.abi.community_pool_address
            ),
            'linker': new this.web3.eth.Contract(
                this.abi.linker_abi,
                this.abi.linker_address
            ),
            'message_proxy_mainnet': new this.web3.eth.Contract(
                this.abi.message_proxy_mainnet_abi,
                this.abi.message_proxy_mainnet_address
            )
        };
    }

    // todo: split - eth

    async depositETHtoSChain(
        chainName: string, opts: TxOpts): Promise<any> {
        const txData = this.contracts.depositBoxEth.methods.deposit(chainName);
        return await transactions.send(this.web3, txData, opts);
    }

    async getMyEth(opts: TxOpts): Promise<any> {
        const txData = this.contracts.depositBoxEth.methods.getMyEth();
        return await transactions.send(this.web3, txData, opts);
    }

    // todo: split - reimbursement wallet

    async reimbursementWalletBalance(address: string, chainName: string): Promise<string> {
        return await this.contracts.communityPool.methods.getBalance(address, chainName).call();
    }

    async reimbursementWalletRecharge(chainName: string, address: string, opts: TxOpts): Promise<any> {
        const txData = this.contracts.communityPool.methods.rechargeUserWallet(chainName, address);
        return await transactions.send(this.web3, txData, opts);
    }

    async reimbursementWalletWithdraw(
        chainName: string, withdrawAmountWei: string, opts: TxOpts): Promise<any> {
        const txData = this.contracts.communityPool.methods.withdrawFunds(
            chainName, withdrawAmountWei);
        return await transactions.send(this.web3, txData, opts);
    }

    // todo: split - locked eth

    async lockedETHAmount(address: string): Promise<string> {
        return await this.contracts.depositBoxEth.methods.approveTransfers(address).call( {
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
                log.info('Waiting for locked ETH balance change - address: ' + address +
                    ', sleeping for ' + sleepInterval + 'ms');
            }
            await helper.sleep(sleepInterval);
        }
    }

    // todo: split - erc20 transfers

    async approveERC20Transfers(tokenName: string, amount: string, opts: TxOpts): Promise<any> {
        const tokenContract = this.ERC20tokens[tokenName];
        const depositBoxAddress = this.contracts.depositBoxERC20.options.address;
        const txData = tokenContract.methods.approve(depositBoxAddress, amount);
        return await transactions.send(this.web3, txData, opts);
    }

    async depositERC20(chainName: string, tokenName: string, amount: string,
        opts: TxOpts): Promise<any> {
        const tokenContract = this.ERC20tokens[tokenName];
        const tokenContractAddress = tokenContract.options.address;

        const txData = this.contracts.depositBoxERC20.methods.depositERC20(
            chainName,
            tokenContractAddress,
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

    async depositERC721(chainName: string, tokenName: string, tokenId: number,
        opts: TxOpts): Promise<any> {
        const tokenContract = this.ERC721tokens[tokenName];
        const tokenContractAddress = tokenContract.options.address;

        const txData = this.contracts.depositBoxERC721.methods.depositERC721(
            chainName,
            tokenContractAddress,
            tokenId
        );
        return await transactions.send(this.web3, txData, opts);
    }

    // todo: split - erc721 with metadata transfers

    async approveERC721WithMetadataTransfer(
        tokenName: string,
        tokenId: number,
        opts: TxOpts
    ): Promise<any> {
        const tokenContract = this.ERC721WithMetadataTokens[tokenName];
        const depositBoxAddress = this.contracts.depositBoxERC721.options.address;
        const txData = tokenContract.methods.approve(depositBoxAddress, tokenId);
        return await transactions.send(this.web3, txData, opts);
    }

    async depositERC721WithMetadata(chainName: string, tokenName: string, tokenId: number,
        opts: TxOpts): Promise<any> {
        const tokenContract = this.ERC721WithMetadataTokens[tokenName];
        const tokenContractAddress = tokenContract.options.address;

        const txData = this.contracts.depositBoxERC721WithMetadata.methods.depositERC721(
            chainName,
            tokenContractAddress,
            tokenId
        );
        return await transactions.send(this.web3, txData, opts);
    }

    // todo: split - erc1155 transfers

    // todo: add approve single ERC1155!

    async approveAllERC1155(tokenName: string, opts: TxOpts): Promise<any> {
        const tokenContract = this.ERC1155tokens[tokenName];
        const depositBoxAddress = this.contracts.depositBoxERC1155.options.address;
        const txData = tokenContract.methods.setApprovalForAll(depositBoxAddress, true);
        return await transactions.send(this.web3, txData, opts);
    }

    async depositERC1155(
        chainName: string, tokenName: string, tokenIds: number | number[],
        amounts: string | string[], opts: TxOpts):Promise<any> {
        const tokenContract = this.ERC1155tokens[tokenName];
        const tokenContractAddress = tokenContract.options.address;

        let txData: any;

        if (typeof tokenIds === 'number' && typeof amounts === 'string') {
            txData = this.contracts.depositBoxERC1155.methods.depositERC1155(
                chainName,
                tokenContractAddress,
                tokenIds,
                amounts
            );
        } else if (tokenIds instanceof Array && amounts instanceof Array) {
            txData = this.contracts.depositBoxERC1155.methods.depositERC1155Batch(
                chainName,
                tokenContractAddress,
                tokenIds,
                amounts
            );
        } else {
            throw new InvalidArgsException(
                'tokenIds and amounts should both be arrays of single objects');
        }
        return await transactions.send(this.web3, txData, opts);
    }

    // todo: split - helper functions

    async getSchainToAllERC20Length(chainName: string): Promise<string> {
        return await this.contracts.depositBoxERC20.methods.getSchainToAllERC20Length(
            chainName).call();
    }

    async getSchainToAllERC20(chainName: string, from: number | string, to: number | string): Promise<string[]> {
        return await this.contracts.depositBoxERC20.methods.getSchainToAllERC20(
            chainName,
            from,
            to
        ).call();
    }

    async getSchainToAllERC721Length(chainName: string): Promise<string> {
        return await this.contracts.depositBoxERC721.methods.getSchainToAllERC721Length(
            chainName).call();
    }

    async getSchainToAllERC721(chainName: string, from: number | string, to: number | string): Promise<string[]> {
        return await this.contracts.depositBoxERC721.methods.getSchainToAllERC721(
            chainName,
            from,
            to
        ).call();
    }

    async getSchainToAllERC1155Length(chainName: string): Promise<number> {
        return await this.contracts.depositBoxERC1155.methods.getSchainToAllERC1155Length(
            chainName).call();
    }

    async getSchainToAllERC1155(chainName: string, from: number | string, to: number | string): Promise<string[]> {
        return await this.contracts.depositBoxERC1155.methods.getSchainToAllERC1155(
            chainName,
            from,
            to
        ).call();
    }

    // todo: split - sChain owner admin functions

    async LINKER_ROLE(): Promise<string> {
        return await this.contracts.linker.methods.LINKER_ROLE().call();
    }

    async grantRoleLinker(role: any, address: string, opts: TxOpts) {
        const txData = this.contracts.linker.methods.grantRole(role, address);
        return await transactions.send(this.web3, txData, opts);
    }

    async connectSchain(chainName: string, contractAddresses: string[], opts: TxOpts): Promise<any> {
        const txData = this.contracts.linker.methods.connectSchain(
            chainName,
            contractAddresses
        );
        return await transactions.send(this.web3, txData, opts);
    }

    async isChainConnected(chainName: string): Promise<boolean> {
        return await this.contracts.message_proxy_mainnet.methods.isConnectedChain(chainName).call();
    }

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
        return await this.contracts.depositBoxERC20.methods.getSchainToERC20(
            chainName, erc20OnMainnet).call();
    }

    async isERC721Added(chainName: string, erc721OnMainnet: string) {
        return await this.contracts.depositBoxERC721.methods.getSchainToERC721(
            chainName, erc721OnMainnet).call();
    }

    async isERC1155Added(chainName: string, erc1155OnMainnet: string) {
        return await this.contracts.depositBoxERC1155.methods.getSchainToERC1155(
            chainName, erc1155OnMainnet).call();
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

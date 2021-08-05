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
 * @file SChain.ts
 * @copyright SKALE Labs 2021-Present
 */

import { BaseChain, ContractsStringMap } from './BaseChain';
import * as transactions from './transactions';
import TxOpts from './TxOpts';
import TokenType from './TokenType';


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
            ),
            'tokenManagerERC20': new this.web3.eth.Contract(
                this.abi.token_manager_erc20_abi,
                this.abi.token_manager_erc20_address
            ),
            'tokenManagerERC721': new this.web3.eth.Contract(
                this.abi.token_manager_erc721_abi,
                this.abi.token_manager_erc721_address
            ),
            'tokenManagerERC1155': new this.web3.eth.Contract(
                this.abi.token_manager_erc1155_abi,
                this.abi.token_manager_erc1155_address
            ),
            'communityLocker': new this.web3.eth.Contract(
                this.abi.community_locker_abi,
                this.abi.community_locker_address
            )
        };
    }

    async ethBalance(address: string): Promise<string> {
        return await this.contracts.ethERC20.methods.balanceOf(address).call({ from: address });
    }

    async withdrawETH(recipientAddress: string, withdrawValue: string, opts: TxOpts): Promise<any> {
        const txData = this.contracts.tokenManagerEth.methods.exitToMain(
            recipientAddress, withdrawValue);
        return await transactions.send(this.web3, txData, opts);
    }

    async setTimeLimitPerMessage(limit: number, opts: TxOpts): Promise<any> {
        const txData = await this.contracts.communityLocker.methods.setTimeLimitPerMessage(limit);
        return await transactions.send(this.web3, txData, opts);
    }

    // todo: split - sChain owner admin functions

    async addERC20TokenByOwner(erc20OnMainnet: string, erc20OnSchain: string, opts: TxOpts):
        Promise<any> {
        const txData = this.contracts.tokenManagerERC20.methods.addERC20TokenByOwner(
            erc20OnMainnet,
            erc20OnSchain
        );
        return await transactions.send(this.web3, txData, opts);
    }

    async isERC20Added(erc20OnMainnet: string) {
        return await this.contracts.tokenManagerERC20.methods.clonesErc20(erc20OnMainnet).call();
    }

    async addERC721TokenByOwner(erc721OnMainnet: string, erc721OnSchain: string, opts: TxOpts):
        Promise<any> {
        const txData = this.contracts.tokenManagerERC721.methods.addERC721TokenByOwner(
            erc721OnMainnet,
            erc721OnSchain
        );
        return await transactions.send(this.web3, txData, opts);
    }

    async addERC1155TokenByOwner(erc1155OnMainnet: string, erc1155OnSchain: string, opts: TxOpts):
        Promise<any> {
        const txData = this.contracts.tokenManagerERC1155.methods.addERC1155TokenByOwner(
            erc1155OnMainnet,
            erc1155OnSchain
        );
        return await transactions.send(this.web3, txData, opts);
    }

    async enableAutomaticDeploy(tokenType: TokenType, opts: TxOpts) {
        const contractName = 'tokenManager' + tokenType;
        const txData = this.contracts[contractName].methods.enableAutomaticDeploy();
        return await transactions.send(this.web3, txData, opts);
    }

    async disableAutomaticDeploy(tokenType: TokenType, opts: TxOpts) {
        const contractName = 'tokenManager' + tokenType;
        const txData = this.contracts[contractName].methods.disableAutomaticDeploy();
        return await transactions.send(this.web3, txData, opts);
    }

    async automaticDeploy(tokenType: TokenType): Promise<string> {
        const contractName = 'tokenManager' + tokenType;
        return await this.contracts[contractName].methods.automaticDeploy().call();
    }

    // todo: split - erc20 transfers

    async approveERC20Transfers(tokenName: string, amount: string, opts: TxOpts): Promise<any> {
        const tokenContract = this.ERC20tokens[tokenName];
        const address = this.contracts.tokenManagerERC20.options.address;
        const txData = tokenContract.methods.approve(address, amount);
        return await transactions.send(this.web3, txData, opts);
    }

    async withdrawERC20(mainnetTokenAddress: string, to: string, amount: string, opts: TxOpts): Promise<any> {
        const txData = this.contracts.tokenManagerERC20.methods.exitToMainERC20(
            mainnetTokenAddress,
            to,
            amount
        );
        return await transactions.send(this.web3, txData, opts);
    }

    // todo: split - erc20 transfers

    async approveERC721Transfer(tokenName: string, tokenId: number, opts: TxOpts): Promise<any> {
        const tokenContract = this.ERC721tokens[tokenName];
        const address = this.contracts.tokenManagerERC721.options.address;
        const txData = tokenContract.methods.approve(address, tokenId);
        return await transactions.send(this.web3, txData, opts);
    }

    async withdrawERC721(mainnetTokenAddress: string, to: string, tokenId: number, opts: TxOpts): Promise<any> {
        const txData = this.contracts.tokenManagerERC721.methods.exitToMainERC721(
            mainnetTokenAddress,
            to,
            tokenId
        );
        return await transactions.send(this.web3, txData, opts);
    }

    // todo: split - erc1155 transfers

    async approveAllERC1155(tokenName: string, tokenId: number, opts: TxOpts): Promise<any> {
        const tokenContract = this.ERC1155tokens[tokenName];
        const address = this.contracts.tokenManagerERC1155.options.address;
        const txData = tokenContract.methods.setApprovalForAll(address, tokenId);
        return await transactions.send(this.web3, txData, opts);
    }

    async withdrawERC1155(mainnetTokenAddress: string, to: string, tokenIds: number | number[],
        amounts: string | string[], opts: TxOpts): Promise<any> {
        const txData = this.contracts.tokenManagerERC1155.methods.exitToMainERC1155(
            mainnetTokenAddress,
            to,
            tokenIds,
            amounts
        );
        return await transactions.send(this.web3, txData, opts);
    }
}

export default SChain;

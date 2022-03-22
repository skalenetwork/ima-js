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
 * @file SChain.ts
 * @copyright SKALE Labs 2021-Present
 */

import { BaseChain, ContractsStringMap } from './BaseChain';
import * as transactions from './transactions';
import TxOpts from './TxOpts';
import TokenType from './TokenType';

import InvalidArgsException from './exceptions/InvalidArgsException';


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
            ),
            'tokenManagerLinker': new this.web3.eth.Contract(
                this.abi.token_manager_linker_abi,
                this.abi.token_manager_linker_address
            )
        };
    }

    async ethBalance(address: string): Promise<string> {
        return await this.contracts.ethERC20.methods.balanceOf(address).call({ from: address });
    }

    async withdrawETH(withdrawValue: string, opts: TxOpts): Promise<any> {
        const txData = this.contracts.tokenManagerEth.methods.exitToMain(withdrawValue);
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

    async isERC721Added(erc721OnMainnet: string) {
        return await this.contracts.tokenManagerERC721.methods.clonesErc721(erc721OnMainnet).call();
    }

    async isERC1155Added(erc1155OnMainnet: string) {
        return await this.contracts.tokenManagerERC1155.methods.clonesErc1155(erc1155OnMainnet).call();
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
        return await this.tokenManager(tokenType).methods.automaticDeploy().call();
    }

    async grantRoleTokenManager(tokenType: TokenType, role: any, address: string, opts: TxOpts) {
        const txData = this.tokenManager(tokenType).methods.grantRole(role, address);
        return await transactions.send(this.web3, txData, opts);
    }

    async AUTOMATIC_DEPLOY_ROLE(tokenType: TokenType): Promise<string> {
        return await this.tokenManager(tokenType).methods.AUTOMATIC_DEPLOY_ROLE().call();
    }

    async TOKEN_REGISTRAR_ROLE(tokenType: TokenType): Promise<string> {
        return await this.tokenManager(tokenType).methods.TOKEN_REGISTRAR_ROLE().call();
    }

    tokenManager(tokenType: TokenType) {
        return this.contracts['tokenManager' + tokenType];
    }

    async CONSTANT_SETTER_ROLE(): Promise<string> {
        return await this.contracts.communityLocker.methods.CONSTANT_SETTER_ROLE().call();
    }

    async grantRoleCommunityLocker(role: any, address: string, opts: TxOpts) {
        const txData = this.contracts.communityLocker.methods.grantRole(role, address);
        return await transactions.send(this.web3, txData, opts);
    }

    // todo: split - erc20 transfers

    async approveERC20Transfers(tokenName: string, amount: string, opts: TxOpts): Promise<any> {
        const tokenContract = this.ERC20tokens[tokenName];
        const address = this.contracts.tokenManagerERC20.options.address;
        const txData = tokenContract.methods.approve(address, amount);
        return await transactions.send(this.web3, txData, opts);
    }

    async withdrawERC20(mainnetTokenAddress: string, amount: string, opts: TxOpts): Promise<any> {
        const txData = this.contracts.tokenManagerERC20.methods.exitToMainERC20(
            mainnetTokenAddress,
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

    async withdrawERC721(mainnetTokenAddress: string, tokenId: number, opts: TxOpts): Promise<any> {
        const txData = this.contracts.tokenManagerERC721.methods.exitToMainERC721(
            mainnetTokenAddress,
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

    async withdrawERC1155(mainnetTokenAddress: string, tokenIds: number | number[],
        amounts: string | string[], opts: TxOpts): Promise<any> {
        let txData: any;

        if (typeof tokenIds === 'number' && typeof amounts === 'string') {
            txData = this.contracts.tokenManagerERC1155.methods.exitToMainERC1155(
                mainnetTokenAddress,
                tokenIds,
                amounts
            );
        } else if (tokenIds instanceof Array && amounts instanceof Array) {
            txData = this.contracts.tokenManagerERC1155.methods.exitToMainERC1155Batch(
                mainnetTokenAddress,
                tokenIds,
                amounts
            );
        } else {
            throw new InvalidArgsException(
                'tokenIds and amounts should both be arrays of single objects');
        }
        return await transactions.send(this.web3, txData, opts);
    }

    // todo: split - s2s transfers

    async connectSchain(schainName: string, opts: TxOpts): Promise<any> {
        const txData = this.contracts.tokenManagerLinker.methods.approve(schainName);
        return await transactions.send(this.web3, txData, opts);
    }

    async transferToSchainERC20(
        targetSchainName: string,
        mainnetTokenAddress: string,
        amount: string,
        opts: TxOpts
    ): Promise<any> {
        const txData = this.contracts.tokenManagerERC20.methods.transferToSchainERC20(
            targetSchainName,
            mainnetTokenAddress,
            amount
        );
        return await transactions.send(this.web3, txData, opts);
    }

    async transferToSchainERC721(
        targetSchainName: string,
        tokenAddress: string,
        tokenId: number,
        opts: TxOpts
    ): Promise<any> {
        const txData = this.contracts.tokenManagerERC721.methods.transferToSchainERC721(
            targetSchainName,
            tokenAddress,
            tokenId
        );
        return await transactions.send(this.web3, txData, opts);
    }

    async transferToSchainERC1155(
        targetSchainName: string,
        tokenAddress: string,
        tokenIds: number | number[],
        amounts: string | string[],
        opts: TxOpts
    ): Promise<any> {
        let txData: any;
        if (typeof tokenIds === 'number' && typeof amounts === 'string') {
            txData = this.contracts.tokenManagerERC1155.methods.transferToSchainERC1155(
                targetSchainName,
                tokenAddress,
                tokenIds,
                amounts
            );
        } else if (tokenIds instanceof Array && amounts instanceof Array) {
            txData = this.contracts.tokenManagerERC1155.methods.transferToSchainERC1155Batch(
                targetSchainName,
                tokenAddress,
                tokenIds,
                amounts
            );
        } else {
            throw new InvalidArgsException(
                'tokenIds and amounts should both be arrays of single objects');
        }
        return await transactions.send(this.web3, txData, opts);
    }
}

export default SChain;

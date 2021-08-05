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
import TxOpts from './TxOpts';
import TokenType from './TokenType';
import * as constants from './constants';


export default class IMA {
    mainnet: MainnetChain;
    schain: SChain;
    constructor(mainnetWeb3: Web3, sChainWeb3: Web3, mainnetAbi: any, sChainAbi: any) {
        this.mainnet = new MainnetChain(mainnetWeb3, mainnetAbi);
        this.schain = new SChain(sChainWeb3, sChainAbi);
    }

    addERC20Token(tokenName: string, mainnetContract: Contract, sChainContact: Contract) {
        this.mainnet.addERC20Token(tokenName, mainnetContract);
        this.schain.addERC20Token(tokenName, sChainContact);
    }

    addERC721Token(tokenName: string, mainnetContract: Contract, sChainContact: Contract) {
        this.mainnet.addERC721Token(tokenName, mainnetContract);
        this.schain.addERC721Token(tokenName, sChainContact);
    }

    addERC1155Token(tokenName: string, mainnetContract: Contract, sChainContact: Contract) {
        this.mainnet.addERC1155Token(tokenName, mainnetContract);
        this.schain.addERC1155Token(tokenName, sChainContact);
    }

    async depositERC20(chainName: string, tokenName: string, to: string, amount: string,
        opts: TxOpts): Promise<any> {
        return await this.mainnet.depositERC20(chainName, tokenName, to, amount, opts);
    }

    async withdrawERC20(tokenName: string, to: string, amount: string, opts: TxOpts): Promise<any> {
        const tokenContract = this.mainnet.ERC20tokens[tokenName];
        const tokenContractAddress = tokenContract.options.address;
        return await this.schain.withdrawERC20(tokenContractAddress, to, amount, opts);
    }

    async depositERC721(chainName: string, tokenName: string, to: string, tokenId: number,
        opts: TxOpts): Promise<any> {
        return await this.mainnet.depositERC721(chainName, tokenName, to, tokenId, opts);
    }

    async withdrawERC721(tokenName: string, to: string, tokenId: number, opts: TxOpts): Promise<any> {
        const tokenContract = this.mainnet.ERC721tokens[tokenName];
        const tokenContractAddress = tokenContract.options.address;
        return await this.schain.withdrawERC721(tokenContractAddress, to, tokenId, opts);
    }

    async depositERC1155(chainName: string, tokenName: string, to: string, tokenIds: number | number[],
        amounts: string | string[], opts: TxOpts): Promise<any> {
        return await this.mainnet.depositERC1155(chainName, tokenName, to, tokenIds, amounts, opts);
    }

    async withdrawERC1155(tokenName: string, to: string, tokenIds: number | number[],
        amounts: string | string[], opts: TxOpts): Promise<any> {
        const tokenContract = this.mainnet.ERC1155tokens[tokenName];
        const tokenContractAddress = tokenContract.options.address;
        return await this.schain.withdrawERC1155(tokenContractAddress, to, tokenIds, amounts, opts);
    }

    // todo: move to .admin or .owner namespace

    async linkERC20Token(chainName: string, erc20OnMainnet: string, erc20OnSchain: string, opts: TxOpts) {
        const isERC20AddedMainnet = await this.mainnet.isERC20Added(chainName, erc20OnMainnet);
        if (!isERC20AddedMainnet){
            await this.mainnet.addERC20TokenByOwner(chainName, erc20OnMainnet, opts);
        }

        const isERC20AddedSchain = await this.schain.isERC20Added(erc20OnMainnet);
        if (isERC20AddedSchain === constants.ZERO_ADDRESS) {
            await this.schain.addERC20TokenByOwner(erc20OnMainnet, erc20OnSchain, opts);
        }
    }

    async linkERC721Token(chainName: string, erc721OnMainnet: string, erc721OnSchain: string, opts: TxOpts) {
        await this.mainnet.addERC721TokenByOwner(chainName, erc721OnMainnet, opts); // todo: run only if whitelist is enabled & if not added yet!
        await this.schain.addERC721TokenByOwner(erc721OnMainnet, erc721OnSchain, opts); // todo: run only if not linked yet!
    }

    async linkERC1155Token(chainName: string, erc1155OnMainnet: string, erc1155OnSchain: string, opts: TxOpts) {
        await this.mainnet.addERC1155TokenByOwner(chainName, erc1155OnMainnet, opts); // todo: run only if whitelist is enabled & if not added yet!
        await this.schain.addERC1155TokenByOwner(erc1155OnMainnet, erc1155OnSchain, opts); // todo: run only if not linked yet!
    }

    async enableAutomaticDeploy(tokenType: TokenType, opts: TxOpts) {
        return await this.schain.enableAutomaticDeploy(tokenType, opts);
    }

    async disableAutomaticDeploy(tokenType: TokenType, opts: TxOpts) {
        return await this.schain.disableAutomaticDeploy(tokenType, opts);
    }
}
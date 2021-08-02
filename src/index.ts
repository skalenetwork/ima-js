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

    // todo: move to .admin or .owner namespace

    async linkERC20Token(chainName: string, erc20OnMainnet: string, erc20OnSchain: string, opts: TxOpts) {
        await this.mainnet.addERC20TokenByOwner(chainName, erc20OnMainnet, opts); // todo: run only if whitelist is enabled & if not added yet!
        await this.schain.addERC20TokenByOwner(erc20OnMainnet, erc20OnSchain, opts); // todo: run only if not linked yet!
    }

    async linkERC721Token(chainName: string, erc721OnMainnet: string, erc721OnSchain: string, opts: TxOpts) {
        await this.mainnet.addERC721TokenByOwner(chainName, erc721OnMainnet, opts); // todo: run only if whitelist is enabled & if not added yet!
        await this.schain.addERC721TokenByOwner(erc721OnMainnet, erc721OnSchain, opts); // todo: run only if not linked yet!
    }
}
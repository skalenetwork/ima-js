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
import * as constants from './constants';
export * as helper from './helper';


export class IMA {
    mainnet: MainnetChain;
    schain: SChain;
    constructor(mainnetWeb3: Web3, sChainWeb3: Web3, mainnetAbi: any, sChainAbi: any) {
        this.mainnet = new MainnetChain(mainnetWeb3, mainnetAbi);
        this.schain = new SChain(sChainWeb3, sChainAbi);
    }

    addERC20Token(tokenName: string, mainnetContract: Contract, sChainContact: Contract) {
        this.mainnet.erc20.addToken(tokenName, mainnetContract);
        this.schain.erc20.addToken(tokenName, sChainContact);
    }

    addERC721Token(tokenName: string, mainnetContract: Contract, sChainContact: Contract) {
        this.mainnet.erc721.addToken(tokenName, mainnetContract);
        this.schain.erc721.addToken(tokenName, sChainContact);
    }

    addERC721WithMetadataToken(tokenName: string, mainnetContract: Contract, sChainContact: Contract) {
        this.mainnet.erc721meta.addToken(tokenName, mainnetContract);
        this.schain.erc721meta.addToken(tokenName, sChainContact);
    }

    addERC1155Token(tokenName: string, mainnetContract: Contract, sChainContact: Contract) {
        this.mainnet.erc1155.addToken(tokenName, mainnetContract);
        this.schain.erc1155.addToken(tokenName, sChainContact);
    }

    async depositERC20(chainName: string, tokenName: string, amount: string,
        opts: TxOpts): Promise<any> {
        return await this.mainnet.erc20.deposit(chainName, tokenName, amount, opts);
    }

    async withdrawERC20(tokenName: string, amount: string, opts: TxOpts): Promise<any> {
        const tokenContract = this.mainnet.erc20.tokens[tokenName];
        const tokenContractAddress = tokenContract.options.address;
        return await this.schain.erc20.withdraw(tokenContractAddress, amount, opts);
    }

    async depositERC721(chainName: string, tokenName: string, tokenId: number,
        opts: TxOpts): Promise<any> {
        return await this.mainnet.erc721.deposit(chainName, tokenName, tokenId, opts);
    }

    async withdrawERC721(tokenName: string, tokenId: number, opts: TxOpts): Promise<any> {
        const tokenContract = this.mainnet.erc721.tokens[tokenName];
        const tokenContractAddress = tokenContract.options.address;
        return await this.schain.erc721.withdraw(tokenContractAddress, tokenId, opts);
    }

    async depositERC721WithMetadata(chainName: string, tokenName: string, tokenId: number,
        opts: TxOpts): Promise<any> {
        return await this.mainnet.erc721meta.deposit(
            chainName, tokenName, tokenId, opts);
    }

    async withdrawERC721Meta(tokenName: string, tokenId: number, opts: TxOpts): Promise<any> {
        const tokenContract = this.mainnet.erc721meta.tokens[tokenName];
        const tokenContractAddress = tokenContract.options.address;
        return await this.schain.erc721meta.withdraw(
            tokenContractAddress, tokenId, opts);
    }

    async depositERC1155(chainName: string, tokenName: string, tokenIds: number | number[],
        amounts: string | string[], opts: TxOpts): Promise<any> {
        return await this.mainnet.erc1155.deposit(
            chainName, tokenName, tokenIds, amounts, opts);
    }

    async withdrawERC1155(tokenName: string, tokenIds: number | number[],
        amounts: string | string[], opts: TxOpts): Promise<any> {
        const tokenContract = this.mainnet.erc1155.tokens[tokenName];
        const tokenContractAddress = tokenContract.options.address;
        return await this.schain.erc1155.withdraw(
            tokenContractAddress, tokenIds, amounts, opts);
    }

    // todo: move to .admin or .owner namespace

    async linkERC20Token(
        chainName: string,
        originChainName: string,
        erc20OnMainnet: string,
        erc20OnSchain: string,
        opts: TxOpts
    ) {
        const isERC20AddedMainnet = await this.mainnet.erc20.isTokenAdded(
            chainName,
            erc20OnMainnet
        );
        if (!isERC20AddedMainnet){
            await this.mainnet.erc20.addTokenByOwner(chainName, erc20OnMainnet, opts);
        }

        const tokenCloneAddress = await this.schain.erc20.getTokenCloneAddress(erc20OnMainnet);
        if (tokenCloneAddress === constants.ZERO_ADDRESS) {
            await this.schain.erc20.addTokenByOwner(
                originChainName, erc20OnMainnet, erc20OnSchain, opts);
        }
    }

    async linkERC721Token(
        chainName: string,
        originChainName: string,
        erc721OnMainnet: string,
        erc721OnSchain: string,
        opts: TxOpts
    ) {
        const isERC721AddedMainnet = await this.mainnet.erc721.isTokenAdded(
            chainName,
            erc721OnMainnet
        );
        if (!isERC721AddedMainnet){
            await this.mainnet.erc721.addTokenByOwner(chainName, erc721OnMainnet, opts);
        }

        const tokenCloneAddress = await this.schain.erc721.getTokenCloneAddress(
            erc721OnMainnet
        );
        if (tokenCloneAddress === constants.ZERO_ADDRESS) {
            await this.schain.erc721.addTokenByOwner(
                originChainName, erc721OnMainnet, erc721OnSchain, opts);
        }
    }

    async linkERC721TokenWithMetadata(
        chainName: string,
        originChainName: string,
        erc721OnMainnet: string,
        erc721OnSchain: string,
        opts: TxOpts
    ) {
        const isERC721AddedMainnet = await this.mainnet.erc721meta.isTokenAdded(
            chainName,
            erc721OnMainnet
        );
        if (!isERC721AddedMainnet){
            await this.mainnet.erc721meta.addTokenByOwner(
                chainName, erc721OnMainnet, opts);
        }

        const tokenCloneAddress = await this.schain.erc721meta.getTokenCloneAddress(
            erc721OnMainnet
        );
        if (tokenCloneAddress === constants.ZERO_ADDRESS) {
            await this.schain.erc721meta.addTokenByOwner(
                originChainName, erc721OnMainnet, erc721OnSchain, opts);
        }
    }

    async linkERC1155Token(
        chainName: string,
        originChainName: string,
        erc1155OnMainnet: string,
        erc1155OnSchain: string,
        opts: TxOpts
    ) {
        const isERC1155AddedMainnet = await this.mainnet.erc1155.isTokenAdded(
            chainName, erc1155OnMainnet);
        if (!isERC1155AddedMainnet){
            await this.mainnet.erc1155.addTokenByOwner(chainName, erc1155OnMainnet, opts);
        }
        const tokenCloneAddress = await this.schain.erc1155.getTokenCloneAddress(
            erc1155OnMainnet);
        if (tokenCloneAddress === constants.ZERO_ADDRESS) {
            await this.schain.erc1155.addTokenByOwner(
                originChainName, erc1155OnMainnet, erc1155OnSchain, opts);
        }
    }

    async isChainConnected(chainName: string): Promise<boolean> {
        return await this.mainnet.messageProxyMainnet.isChainConnected(chainName);
    }

    async connectSchain(chainName: string, opts: TxOpts) {
        const contractAddresses = [
            this.schain.tokenManagerLinker.address,
            this.schain.communityLocker.address,
            this.schain.eth.address,
            this.schain.erc20.address,
            this.schain.erc721.address,
            this.schain.erc721meta.address,
            this.schain.erc1155.address
        ];
        return await this.mainnet.linker.connectSchain(chainName, contractAddresses, opts);
    }
}
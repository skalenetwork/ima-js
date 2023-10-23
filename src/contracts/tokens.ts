import { Contract, type Provider, type InterfaceAbi } from 'ethers';

import erc20Abi from '../abi/erc20';
import erc721Abi from '../abi/erc721';
import erc721MetaAbi from '../abi/erc721meta';
import erc1155Abi from '../abi/erc1155';
import erc20WrapperAbi from '../abi/erc20_wrapper';

export type TokenType =
    | 'erc20'
    | 'erc20wrap'
    | 'erc721'
    | 'erc721meta'
    | 'erc1155';

export const ERC_ABIS: { [tokenType in TokenType]: InterfaceAbi } = {
    erc20: erc20Abi.abi,
    erc20wrap: erc20WrapperAbi.abi,
    erc721: erc721Abi.abi,
    erc721meta: erc721MetaAbi.abi,
    erc1155: erc1155Abi.abi
};

export function initToken (tokenType: TokenType, address: `0x${string}`, provider: Provider): Contract {
    return new Contract(address, ERC_ABIS[tokenType], provider);
}

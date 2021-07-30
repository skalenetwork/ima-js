import Web3 from 'web3';
import * as dotenv from "dotenv";

import MainnetChain from '../src/MainnetChain';
import SChain from '../src/SChain';
import IMA from '../src/index';

import * as helper from '../src/helper';

dotenv.config();


const MAINNET_ENDPOINT = (process.env["MAINNET_ENDPOINT"] as string);
const MAINNET_ABI_FILEPATH = process.env["MAINNET_ABI_FILEPATH"] || __dirname + '/../abis/proxyMainnet.json';

const SCHAIN_ENDPOINT = (process.env["SCHAIN_ENDPOINT"] as string);
const SCHAIN_ABI_FILEPATH = process.env["SCHAIN_ABI_FILEPATH"] || __dirname + '/../abis/proxySchain.json';

export const MAINNET_PRIVATE_KEY = helper.add0x(process.env.MAINNET_PRIVATE_KEY);
export const SCHAIN_PRIVATE_KEY = helper.add0x(process.env.SCHAIN_PRIVATE_KEY);

export const CHAIN_NAME_SCHAIN = (process.env["CHAIN_NAME_SCHAIN"] as string);

export const TEST_WEI_TRANSFER_VALUE = '10000000000000000';
export const TEST_TOKENS_TRANSFER_VALUE = '1000';


export const MAINNET_TOKENS_ABI_FILEPATH = __dirname +  '/test_tokens/data/TestTokens.abi.mn.json';
export const SCHAIN_TOKENS_ABI_FILEPATH = __dirname +  '/test_tokens/data/TestTokens.abi.sc.json';


export function initTestIMA() {
    const mainnetWeb3 = new Web3(MAINNET_ENDPOINT);
    const sChainWeb3 = new Web3(SCHAIN_ENDPOINT);
    const mainnetAbi = helper.jsonFileLoad(MAINNET_ABI_FILEPATH);
    const sChainAbi = helper.jsonFileLoad(SCHAIN_ABI_FILEPATH);
    return new IMA(mainnetWeb3, sChainWeb3, mainnetAbi, sChainAbi)
}


export function initTestSChain() {
    const provider = new Web3.providers.HttpProvider(SCHAIN_ENDPOINT);
    const web3 = new Web3(provider);
    const abi = helper.jsonFileLoad(SCHAIN_ABI_FILEPATH);
    return new SChain(web3, abi);
}


export function initTestMainnet() {
    const provider = new Web3.providers.HttpProvider(MAINNET_ENDPOINT);
    const web3 = new Web3(provider);
    const abi = helper.jsonFileLoad(MAINNET_ABI_FILEPATH);
    return new MainnetChain(web3, abi);
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


export function initTestTokens(mainnetWeb3: Web3, sChainWeb3: Web3) {
    const mainnetTokensMeta = helper.jsonFileLoad(MAINNET_TOKENS_ABI_FILEPATH);
    const sChainTokensMeta = helper.jsonFileLoad(SCHAIN_TOKENS_ABI_FILEPATH);
    return {
        'mainnetERC20': new mainnetWeb3.eth.Contract(mainnetTokensMeta.ERC20_abi, mainnetTokensMeta.ERC20_address),
        'mainnetERC721': new mainnetWeb3.eth.Contract(mainnetTokensMeta.ERC721_abi, mainnetTokensMeta.ERC721_address),
        'sChainERC20': new sChainWeb3.eth.Contract(sChainTokensMeta.ERC20_abi, sChainTokensMeta.ERC20_address),
        'sChainERC721': new sChainWeb3.eth.Contract(sChainTokensMeta.ERC721_abi, sChainTokensMeta.ERC721_address)
    }
}

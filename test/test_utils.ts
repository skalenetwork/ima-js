let Web3 = require('web3');
import * as dotenv from "dotenv";

import MainnetChain from '../src/MainnetChain';
import SChain from '../src/SChain';

import * as helper from '../src/helper';

dotenv.config();


const MAINNET_ENDPOINT = process.env["MAINNET_ENDPOINT"];
const MAINNET_ABI_FILEPATH = process.env["MAINNET_ABI_FILEPATH"] || __dirname + '/../abis/proxyMainnet.json';

const SCHAIN_ENDPOINT = process.env["SCHAIN_ENDPOINT"];
const SCHAIN_ABI_FILEPATH = process.env["SCHAIN_ABI_FILEPATH"] || __dirname + '/../abis/proxySchain.json';

export const MAINNET_PRIVATE_KEY = helper.add0x(process.env.MAINNET_PRIVATE_KEY);
export const SCHAIN_PRIVATE_KEY = helper.add0x(process.env.SCHAIN_PRIVATE_KEY);

export const CHAIN_NAME_SCHAIN = (process.env["CHAIN_NAME_SCHAIN"] as string);
export const TEST_WEI_TRANSFER_VALUE = '10000000000000000';


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

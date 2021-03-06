import Web3 from 'web3';
import {AbiItem} from 'web3-utils';

import * as dotenv from "dotenv";

import MainnetChain from '../src/MainnetChain';
import SChain from '../src/SChain';
import { IMA } from '../src/index';
import TokenType from '../src/TokenType';
import TxOpts from "../src/TxOpts";
import { Contract } from 'web3-eth-contract';

import { ContractsStringMap, BaseChain } from '../src/BaseChain';

import * as helper from '../src/helper';

dotenv.config();

export const CHAIN_NAME_SCHAIN = (process.env["CHAIN_NAME_SCHAIN"] as string);
export const MAINNET_CHAIN_NAME = 'Mainnet';

const MAINNET_ENDPOINT = (process.env["MAINNET_ENDPOINT"] as string);
const MAINNET_ABI_FILEPATH = process.env["MAINNET_ABI_FILEPATH"] || __dirname + '/../skale-ima-sdk/contracts_data/proxyMainnet.json';

const SCHAIN_ENDPOINT = (process.env["SCHAIN_ENDPOINT"] as string);
const SCHAIN_ABI_FILEPATH = process.env["SCHAIN_ABI_FILEPATH"] || __dirname + '/../skale-ima-sdk/contracts_data/proxySchain.json';

export const SDK_PRIVATE_KEY = helper.add0x(process.env.SDK_PRIVATE_KEY);
export const MAINNET_PRIVATE_KEY = helper.add0x(process.env.TEST_PRIVATE_KEY);
export const SCHAIN_PRIVATE_KEY = MAINNET_PRIVATE_KEY;

export const TEST_WEI_TRANSFER_VALUE = '20000000000000000';
export const TEST_WEI_REIMBURSEMENT_VALUE = '500000000000000000';
export const TEST_TOKENS_TRANSFER_VALUE = '1000';


const TOKENS_ABI_FOLDER = __dirname + '/../test-tokens/data/';

const NETWORKS = ['mainnet', 'schain'];
const TOKEN_NAME = 'TEST';


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

export async function reimburseWallet(ima: IMA) {
    let testAddress = helper.privateKeyToAddress(ima.schain.web3, MAINNET_PRIVATE_KEY);
    let txOpts: TxOpts = {
        value: TEST_WEI_REIMBURSEMENT_VALUE,
        address: testAddress,
        privateKey: MAINNET_PRIVATE_KEY
    };
    await ima.mainnet.communityPool.recharge(
        CHAIN_NAME_SCHAIN,
        testAddress,
        txOpts
    );
}


export async function grantPermissions(ima: IMA): Promise<any> {
    let testAddress = helper.privateKeyToAddress(ima.schain.web3, SCHAIN_PRIVATE_KEY);
    let txOpts: TxOpts = {
        address: testAddress,
        privateKey: MAINNET_PRIVATE_KEY
    };

    let deployRole = await ima.schain.erc721.AUTOMATIC_DEPLOY_ROLE();
    let registarRole = await ima.schain.erc721.TOKEN_REGISTRAR_ROLE();
    await ima.schain.erc721.grantRole(deployRole, testAddress, txOpts);
    await ima.schain.erc721.grantRole(registarRole, testAddress, txOpts);

    let constantRole = await ima.schain.communityLocker.CONSTANT_SETTER_ROLE();
    await ima.schain.communityLocker.grantRole(constantRole, testAddress, txOpts);

    let sdkAddress = helper.privateKeyToAddress(ima.schain.web3, SDK_PRIVATE_KEY);
    let sdkTxOpts: TxOpts = {
        address: sdkAddress,
        privateKey: SDK_PRIVATE_KEY
    };

    let linkerRole = await ima.mainnet.linker.LINKER_ROLE();
    await ima.mainnet.linker.grantRole(linkerRole, testAddress, sdkTxOpts);
}


export function initTestTokens(mainnetWeb3: Web3, sChainWeb3: Web3) {
    let testTokens: ContractsStringMap = {};
    for (let tokenName in TokenType) {
        for (let i in NETWORKS) {
            let network = NETWORKS[i];
            let filepath = TOKENS_ABI_FOLDER + tokenName + 'Example-' + TOKEN_NAME + '-' + network + '.json';
            let tokenMeta = helper.jsonFileLoad(filepath);
            let keyName = network + tokenName;

            let abiKey = tokenName.toLowerCase() + '_abi';
            let abi: AbiItem = tokenMeta[abiKey];
           
            let addressKey = tokenName.toLowerCase() + '_address';
            let address = tokenMeta[addressKey];

            if (network == 'mainnet') {
                testTokens[keyName] = new mainnetWeb3.eth.Contract(abi, address);
            } else {
                testTokens[keyName] = new sChainWeb3.eth.Contract(abi, address);
            }
        }
           
    }
    return testTokens;
}


export async function getERC1155Balances(
    chain: BaseChain,
    tokenContract: Contract,
    address: string,
    tokenIds: number | number[],
    print: boolean = true
): Promise<string[]>{

    let ids: number[];
    let balances: string[] = [];
    if (typeof tokenIds == 'number') {
        ids = [tokenIds as number];
    } else {
        ids = tokenIds as number[];
    }
    for (let i in ids) {
        let balance = await chain.getERC1155Balance(tokenContract, address, ids[i]);
        balances.push(balance);
        if (print) {
            console.log(chain.constructor.name + ' - ' + tokenContract.options.address + 'balance for ' + address + ': ' + balance)
        }
    }
    if (print) {
        console.log();
    }
    return balances;
}

export const toNumbers = (arr: string[]) => arr.map(Number);
export const toStrings = (arr: number[]) => arr.map(String);

export function addArrays(array1: number[], array2: number[]): number[] {
    return array1.map(function (num: number, idx: number) {
        return num + array2[idx];
    });
}

export function subArrays(array1: number[], array2: number[]): number[] {
    return array1.map(function (num: number, idx: number) {
        return num - array2[idx];
    });
}
// import Web3 from 'web3';
// import {AbiItem} from 'web3-utils';

import { Wallet, Contract, Provider, JsonRpcProvider } from "ethers";

import * as dotenv from "dotenv";

import MainnetChain from '../src/MainnetChain';
import SChain from '../src/SChain';
import { IMA } from '../src/index';
import TokenType from '../src/TokenType';
import TxOpts from "../src/TxOpts";

import { ContractsStringMap, BaseChain } from '../src/BaseChain';

import * as helper from '../src/helper';

dotenv.config();

export const CHAIN_NAME_SCHAIN = (process.env["CHAIN_NAME_SCHAIN"] as string);
export const CHAIN_NAME_SCHAIN_2 = (process.env["CHAIN_NAME_SCHAIN_2"] as string);
export const MAINNET_CHAIN_NAME = 'Mainnet';

const MAINNET_ENDPOINT = (process.env["MAINNET_ENDPOINT"] as string);
const MAINNET_ABI_FILEPATH = process.env["MAINNET_ABI_FILEPATH"] || __dirname + '/../skale-ima-sdk/contracts_data/proxyMainnet.json';

const SCHAIN_ENDPOINT = (process.env["SCHAIN_ENDPOINT"] as string);
const SCHAIN_ABI_FILEPATH = process.env["SCHAIN_ABI_FILEPATH"] || __dirname + '/../skale-ima-sdk/contracts_data/proxySchain.json';

export const SDK_PRIVATE_KEY = helper.add0x(process.env.SDK_PRIVATE_KEY);
export const MAINNET_PRIVATE_KEY = helper.add0x(process.env.TEST_PRIVATE_KEY);
export const SCHAIN_PRIVATE_KEY = MAINNET_PRIVATE_KEY;

export const TEST_WEI_TRANSFER_VALUE = 20000000000000000n;
export const TEST_WEI_REIMBURSEMENT_VALUE = 5000000000000000000n;
export const TEST_TOKENS_TRANSFER_VALUE = 1000n;


const TOKENS_ABI_FOLDER = __dirname + '/../test-tokens/data/';

const NETWORKS = ['mainnet', 'schain'];
const TOKEN_NAME = 'TEST';


export function initTestIMA() {
    const providerMainnet = new JsonRpcProvider(MAINNET_ENDPOINT);
    const providerSchain = new JsonRpcProvider(SCHAIN_ENDPOINT);
    const mainnetAbi = helper.jsonFileLoad(MAINNET_ABI_FILEPATH);
    const sChainAbi = helper.jsonFileLoad(SCHAIN_ABI_FILEPATH);
    return new IMA(providerMainnet, providerSchain, mainnetAbi, sChainAbi)
}


export function initTestSChain() {
    const provider = new JsonRpcProvider(SCHAIN_ENDPOINT);
    const abi = helper.jsonFileLoad(SCHAIN_ABI_FILEPATH);
    return new SChain(provider, abi);
}


export function initTestMainnet() {
    const provider = new JsonRpcProvider(MAINNET_ENDPOINT);
    const abi = helper.jsonFileLoad(MAINNET_ABI_FILEPATH);
    return new MainnetChain(provider, abi);
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function reimburseWallet(ima: IMA) {
    let wallet = new Wallet(MAINNET_PRIVATE_KEY);
    let txOpts: TxOpts = {
        value: TEST_WEI_REIMBURSEMENT_VALUE,
        address: wallet.address,
        privateKey: MAINNET_PRIVATE_KEY
    };
    await ima.mainnet.communityPool.recharge(
        CHAIN_NAME_SCHAIN,
        wallet.address,
        txOpts
    );
}


export async function grantPermissions(ima: IMA): Promise<any> {
    let wallet = new Wallet(SCHAIN_PRIVATE_KEY);
    let txOpts: TxOpts = {
        address: wallet.address,
        privateKey: MAINNET_PRIVATE_KEY
    };

    let deployRole = await ima.schain.erc721.AUTOMATIC_DEPLOY_ROLE();
    let registarRole = await ima.schain.erc721.TOKEN_REGISTRAR_ROLE();
    await ima.schain.erc721.grantRole(deployRole, wallet.address, txOpts);
    await ima.schain.erc721.grantRole(registarRole, wallet.address, txOpts);

    let constantRole = await ima.schain.communityLocker.CONSTANT_SETTER_ROLE();
    await ima.schain.communityLocker.grantRole(constantRole, wallet.address, txOpts);

    let sdkWallet = new Wallet(SDK_PRIVATE_KEY);
    let sdkTxOpts: TxOpts = {
        address: sdkWallet.address,
        privateKey: SDK_PRIVATE_KEY
    };

    let linkerRole = await ima.mainnet.linker.LINKER_ROLE();
    await ima.mainnet.linker.grantRole(linkerRole, wallet.address, sdkTxOpts);
}


export function initTestTokens(
    providerMainnet: Provider,
    providerSchain: Provider
) {
    let testTokens: ContractsStringMap = {};
    for (let tokenName in TokenType) {
        for (let i in NETWORKS) {
            let network = NETWORKS[i];
            let filepath = TOKENS_ABI_FOLDER + tokenName + 'Example-' + TOKEN_NAME + '-' + network + '.json';
            let tokenMeta = helper.jsonFileLoad(filepath);
            let keyName = network + tokenName;

            let abiKey = tokenName.toLowerCase() + '_abi';
            let abi = tokenMeta[abiKey];

            let addressKey = tokenName.toLowerCase() + '_address';
            let address = tokenMeta[addressKey];

            if (network == 'mainnet') {
                testTokens[keyName] = new Contract(address, abi, providerMainnet);
            } else {
                testTokens[keyName] = new Contract(address, abi, providerSchain);
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
): Promise<bigint[]> {
    let ids: number[];
    let balances: bigint[] = [];
    if (typeof tokenIds == 'bigint') {
        ids = [tokenIds as number];
    } else {
        ids = tokenIds as number[];
    }
    for (let i in ids) {
        let balance = await chain.getERC1155Balance(tokenContract, address, ids[i]);
        balances.push(balance);
        if (print) {
            console.log(chain.constructor.name + ' - ' + await tokenContract.getAddress() + 'balance for ' + address + ': ' + balance);
        }
    }
    if (print) {
        console.log();
    }
    return balances;
}

export const toNumbers = (arr: bigint[]) => arr.map(Number);
export const toStrings = (arr: number[]) => arr.map(String);


export function addArrays(arr1: bigint[], arr2: bigint[]): bigint[] {
    if (arr1.length !== arr2.length) {
        throw new Error('Arrays must be of the same length');
    }

    let result: bigint[] = [];

    for (let i = 0; i < arr1.length; i++) {
        result[i] = arr1[i] + arr2[i];
    }

    return result;
}


export function subArrays(array1: bigint[], array2: bigint[]): bigint[] {
    return array1.map(function (num: bigint, idx: number) {
        return num - array2[idx];
    });
}
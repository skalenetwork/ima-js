import chaiAsPromised from "chai-as-promised";
import chai = require("chai");
import * as dotenv from "dotenv";

import IMA from '../src/index';
import TxOpts from "../src/TxOpts";
import { ContractsStringMap, BaseChain } from '../src/BaseChain';

import * as helper from '../src/helper';
import * as constants from '../src/constants';
import * as test_utils from './test_utils';


dotenv.config();

chai.should();
chai.use(chaiAsPromised);

const assertArrays = require('chai-arrays');
chai.use(assertArrays);
let expect = require('chai').expect;

const DEFAULT_SLEEP = 3000;


async function getERC1155Balances(chain: BaseChain, erc1155Name: string,
    address: string, tokenIds: number | number[], print: boolean = true): Promise<string[]>{
    let ids: number[];
    let balances: string[] = [];
    if (typeof tokenIds == 'number') {
        ids = [tokenIds as number];
    } else {
        ids = tokenIds as number[];
    }
    for (let i in ids) {
        let balance = await chain.getERC1155Balance(erc1155Name, address, ids[i]);
        balances.push(balance);
        if (print) {
            console.log(chain.constructor.name + ' - ' + erc1155Name + 'balance for ' + address + ': ' + balance)
        }
    }
    if (print) {
        console.log();
    }
    return balances;
}

const toNumbers = (arr: string[]) => arr.map(Number);
const toStrings = (arr: number[]) => arr.map(String);

function addArrays(array1: number[], array2: number[]): number[] {
    return array1.map(function (num: number, idx: number) {
        return num + array2[idx];
    });
}

function subArrays(array1: number[], array2: number[]): number[] {
    return array1.map(function (num: number, idx: number) {
        return num - array2[idx];
    });
}

describe("ERC20/ERC721/ERC1155 tokens tests", () => {
    let opts: TxOpts;
    let testTokens: ContractsStringMap;

    let address: string;
    let ima: IMA;
    let erc20Name: string;

    let erc721Name: string;
    let erc721TokenId: number;

    let erc1155Name: string;
    let erc1155TokenId: number;
    
    let erc1155TokenIds: Array<number>;
    let erc1155Amounts: Array<string>;

    before(async () => {
        ima = test_utils.initTestIMA();
        address = helper.privateKeyToAddress(ima.schain.web3, test_utils.SCHAIN_PRIVATE_KEY);
        testTokens = test_utils.initTestTokens(ima.mainnet.web3, ima.schain.web3);
        opts = {
            address: address,
            privateKey: test_utils.SCHAIN_PRIVATE_KEY
        };

        erc20Name = 'testERC20';
        
        erc721Name = 'testERC721';
        erc721TokenId = 1;

        erc1155TokenId = 1;
        erc1155Name = 'testERC1155';
        erc1155TokenIds = [1, 2, 3];
        erc1155Amounts = ['1000', '2000', '3000'];
    });

    it("Test ERC20 approve/balance/deposit/withdraw", async () => {
        ima.addERC20Token(erc20Name, testTokens.mainnetERC20, testTokens.schainERC20);

        await ima.linkERC20Token(
            test_utils.CHAIN_NAME_SCHAIN,
            testTokens.mainnetERC20.options.address,
            testTokens.schainERC20.options.address,
            opts
        )

        const erc20balanceMainnet1 = await ima.mainnet.getERC20Balance(erc20Name, address);
        const erc20balanceSChain1 = await ima.schain.getERC20Balance(erc20Name, address);

        console.log(erc20balanceMainnet1, erc20balanceSChain1);

        await ima.mainnet.approveERC20Transfers(erc20Name, constants.MAX_APPROVAL_AMOUNT, opts);
        await ima.depositERC20(test_utils.CHAIN_NAME_SCHAIN, erc20Name, address,
            test_utils.TEST_TOKENS_TRANSFER_VALUE, opts);
    
        await test_utils.sleep(15000);

        const erc20balanceMainnet2 = await ima.mainnet.getERC20Balance(erc20Name, address);
        const erc20balanceSChain2 = await ima.schain.getERC20Balance(erc20Name, address);

        console.log(erc20balanceMainnet2, erc20balanceSChain2);
        // todo: add balance assert here

        await ima.schain.approveERC20Transfers(erc20Name, constants.MAX_APPROVAL_AMOUNT, opts);
        await ima.withdrawERC20(erc20Name, address, test_utils.TEST_TOKENS_TRANSFER_VALUE,
            opts);

        await test_utils.sleep(15000);
        
        const erc20balanceMainnet3 = await ima.mainnet.getERC20Balance(erc20Name, address);
        const erc20balanceSChain3 = await ima.schain.getERC20Balance(erc20Name, address);

        console.log(erc20balanceMainnet3, erc20balanceSChain3);
        // todo: add balance assert here
    });


    it("Test ERC721 approve/balance/deposit/withdraw", async () => {
        ima.addERC721Token(erc721Name, testTokens.mainnetERC721, testTokens.schainERC721);

        await ima.linkERC721Token(
            test_utils.CHAIN_NAME_SCHAIN,
            testTokens.mainnetERC721.options.address,
            testTokens.schainERC721.options.address,
            opts
        );

        const erc721OwnerMainnet1 = await ima.mainnet.getERC721OwnerOf(erc721Name, erc721TokenId);
        const erc721OwnerSchain1 = await ima.schain.getERC721OwnerOf(erc721Name, erc721TokenId);

        console.log(erc721OwnerMainnet1);
        console.log(erc721OwnerSchain1);

        await ima.mainnet.approveERC721Transfer(erc721Name, erc721TokenId, opts);
        await ima.depositERC721(test_utils.CHAIN_NAME_SCHAIN, erc721Name, address,
            erc721TokenId, opts);

        await test_utils.sleep(15000);

        const erc721OwnerMainnet2 = await ima.mainnet.getERC721OwnerOf(erc721Name, erc721TokenId);
        const erc721OwnerSchain2 = await ima.schain.getERC721OwnerOf(erc721Name, erc721TokenId);
        
        console.log(erc721OwnerMainnet2);
        console.log(erc721OwnerSchain2);

        await ima.schain.approveERC721Transfer(erc721Name, erc721TokenId, opts);
        await ima.withdrawERC721(erc721Name, address, erc721TokenId, opts);

        await test_utils.sleep(15000);
        
        const erc721OwnerMainnet3 = await ima.mainnet.getERC721OwnerOf(erc721Name, erc721TokenId);
        const erc721OwnerSchain3 = await ima.schain.getERC721OwnerOf(erc721Name, erc721TokenId);
        
        console.log(erc721OwnerMainnet3);
        console.log(erc721OwnerSchain3);

    });

    it("Test ERC1155 approve/balance/deposit/withdraw", async () => {
        ima.addERC1155Token(erc1155Name, testTokens.mainnetERC1155, testTokens.schainERC1155);

        await ima.linkERC1155Token(
            test_utils.CHAIN_NAME_SCHAIN,
            testTokens.mainnetERC1155.options.address,
            testTokens.schainERC1155.options.address,
            opts
        );

        const balanceMainnet1 = await getERC1155Balances(ima.mainnet, erc1155Name, address, erc1155TokenId);
        const balanceSchain1 = await getERC1155Balances(ima.schain, erc1155Name, address, erc1155TokenId);

        console.log(balanceMainnet1);
        console.log(balanceSchain1);

        await ima.mainnet.approveAllERC1155(erc1155Name, opts);
        
        await ima.depositERC1155(test_utils.CHAIN_NAME_SCHAIN, erc1155Name, address,
            erc1155TokenId, test_utils.TEST_TOKENS_TRANSFER_VALUE, opts);

        await test_utils.sleep(15000);

        const balanceMainnet2 = await ima.mainnet.getERC1155Balance(erc1155Name, address, erc1155TokenId);
        const balanceSchain2 = await ima.schain.getERC1155Balance(erc1155Name, address, erc1155TokenId);

        console.log(balanceMainnet2);
        console.log(balanceSchain2);

        await ima.schain.approveAllERC1155(erc1155Name, erc1155TokenId, opts);
        await ima.withdrawERC1155(erc1155Name, address, erc1155TokenId,
            test_utils.TEST_TOKENS_TRANSFER_VALUE, opts);

        await test_utils.sleep(15000);
        
        const balanceMainnet3 = await ima.mainnet.getERC1155Balance(erc1155Name, address, erc1155TokenId);
        const balanceSchain3 = await ima.schain.getERC1155Balance(erc1155Name, address, erc1155TokenId);

        console.log(balanceMainnet3);
        console.log(balanceSchain3);
    });

    it.only("Test ERC1155 batch deposit/withdraw", async () => {
        ima.addERC1155Token(erc1155Name, testTokens.mainnetERC1155, testTokens.schainERC1155);

        const balancesMainnet1 = await getERC1155Balances(ima.mainnet, erc1155Name, address, erc1155TokenIds);
        const balancesSchain1 = await getERC1155Balances(ima.schain, erc1155Name, address, erc1155TokenIds);

        await ima.depositERC1155(test_utils.CHAIN_NAME_SCHAIN, erc1155Name, address,
            erc1155TokenIds, erc1155Amounts, opts);
        await ima.schain.waitERC1155BalanceChange(erc1155Name, address, erc1155TokenIds[0], balancesSchain1[0], DEFAULT_SLEEP);

        let expectedMainnetBalances = subArrays(toNumbers(balancesMainnet1), toNumbers(erc1155Amounts));
        let expectedSchainBalances = addArrays(toNumbers(balancesSchain1), toNumbers(erc1155Amounts));

        const balancesMainnet2 = await getERC1155Balances(ima.mainnet, erc1155Name, address, erc1155TokenIds);
        const balancesSchain2 = await getERC1155Balances(ima.schain, erc1155Name, address, erc1155TokenIds);

        expect(balancesMainnet2).to.be.equalTo(toStrings(expectedMainnetBalances));
        expect(balancesSchain2).to.be.equalTo(toStrings(expectedSchainBalances));

        await ima.withdrawERC1155(erc1155Name, address, erc1155TokenIds, erc1155Amounts, opts);
        await ima.mainnet.waitERC1155BalanceChange(erc1155Name, address, erc1155TokenIds[0], balancesMainnet2[0], DEFAULT_SLEEP);

        const balancesMainnet3 = await getERC1155Balances(ima.mainnet, erc1155Name, address, erc1155TokenIds);
        const balancesSchain3 = await getERC1155Balances(ima.schain, erc1155Name, address, erc1155TokenIds);

        expect(balancesMainnet3).to.be.equalTo(balancesMainnet1);
        expect(balancesSchain3).to.be.equalTo(balancesSchain1);
    });

});
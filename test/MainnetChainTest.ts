import chaiAsPromised from "chai-as-promised";
import chai = require("chai");
import * as dotenv from "dotenv";

let Web3 = require('web3');

import MainnetChain from '../src/MainnetChain';
import SChain from '../src/SChain';

import * as helper from '../src/helper';

import * as test_utils from './test_utils';

dotenv.config();

chai.should();
chai.use(chaiAsPromised);

const MAINNET_ENDPOINT = process.env["MAINNET_ENDPOINT"];
const MAINNET_PRIVATE_KEY = helper.add0x(process.env.MAINNET_PRIVATE_KEY);
const MAINNET_ABI_FILEPATH = process.env["MAINNET_ABI_FILEPATH"] || __dirname + '/../abis/proxyMainnet.json';

const CHAIN_NAME_SCHAIN = (process.env["CHAIN_NAME_SCHAIN"] as string);

const TEST_WEI_TRANSFER_VALUE = '10000000000000000';


describe("Mainnet chain test", () => {
    let address: string;
    let mainnetChain: MainnetChain;
    let sChain: SChain;

    before(async () => {
        mainnetChain = test_utils.initTestMainnet();
        sChain = test_utils.initTestSChain();
        address = helper.privateKeyToAddress(mainnetChain.web3, MAINNET_PRIVATE_KEY);
    });

    it("Requests ETH balance for Mainnet chain", async () => {
        let balance = await mainnetChain.ethBalance(address);
        balance.should.be.a('string');
    });

    it("Deposits ETH from Mainnet to sChain", async () => {
        let mainnetBalanceBefore = await mainnetChain.ethBalance(address);
        let sChainBalanceBefore = await sChain.ethBalance(address);

        await mainnetChain.depositETHtoSChain(
            CHAIN_NAME_SCHAIN,
            address,
            TEST_WEI_TRANSFER_VALUE,
            address,
            MAINNET_PRIVATE_KEY
        );

        let mainnetBalanceAfter = await mainnetChain.ethBalance(address);
        let sChainBalanceAfter = await sChain.ethBalance(address);

        console.log(mainnetBalanceBefore, mainnetBalanceAfter);
        console.log(sChainBalanceBefore, sChainBalanceAfter);
    });
});
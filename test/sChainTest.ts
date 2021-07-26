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


describe("sChain test", () => {
    let address: string;
    let mainnet_address: string;
    let mainnetChain: MainnetChain;
    let sChain: SChain;

    before(async () => {
        mainnetChain = test_utils.initTestMainnet();
        sChain = test_utils.initTestSChain();
        address = helper.privateKeyToAddress(sChain.web3, test_utils.SCHAIN_PRIVATE_KEY);
        mainnet_address = helper.privateKeyToAddress(sChain.web3, test_utils.MAINNET_PRIVATE_KEY);
    });

    it("Requests ERC20 ETH balance for sChain", async () => {
        let balance = await sChain.ethBalance(address);
        balance.should.be.a('string');
    });

    it("Deposits ETH from Mainnet to sChain", async () => {
        await mainnetChain.depositETHtoSChain(
            test_utils.CHAIN_NAME_SCHAIN,
            address,
            test_utils.TEST_WEI_TRANSFER_VALUE,
            mainnet_address,
            undefined,
            test_utils.MAINNET_PRIVATE_KEY
        );

        let mainnetBalanceBefore = await mainnetChain.ethBalance(address);
        let sChainBalanceBefore = await sChain.ethBalance(address);

        console.log('going to withdrawETH!!!!')
        await sChain.withdrawETH(
            address,
            test_utils.TEST_WEI_TRANSFER_VALUE,
            address,
            undefined,
            test_utils.SCHAIN_PRIVATE_KEY
        );

        await test_utils.sleep(10000);

        let sChainBalanceAfter = await sChain.ethBalance(address);
        let mainnetBalanceAfter = await mainnetChain.ethBalance(address);

        console.log(mainnetBalanceBefore, mainnetBalanceAfter);
        console.log(sChainBalanceBefore, sChainBalanceAfter);

        // sChainBalanceAfter.should.be.equal(expectedSChainBalance.toString(10))
    });


});
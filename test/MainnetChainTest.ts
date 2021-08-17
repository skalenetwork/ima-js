import chaiAsPromised from "chai-as-promised";
import chai = require("chai");
import * as dotenv from "dotenv";

let Web3 = require('web3');

import MainnetChain from '../src/MainnetChain';
import SChain from '../src/SChain';

import * as helper from '../src/helper';

import * as test_utils from './test_utils';
import { utils } from "mocha";
import TxOpts from "../src/TxOpts";

dotenv.config();

chai.should();
chai.use(chaiAsPromised);


describe("Mainnet chain tests", () => {
    let address: string;
    let mainnetChain: MainnetChain;
    let sChain: SChain;
    let transferValBN: any;

    before(async () => {
        mainnetChain = test_utils.initTestMainnet();
        sChain = test_utils.initTestSChain();
        address = helper.privateKeyToAddress(mainnetChain.web3, test_utils.MAINNET_PRIVATE_KEY);
        transferValBN = mainnetChain.web3.utils.toBN(test_utils.TEST_WEI_TRANSFER_VALUE);
    });

    it("Requests ETH balance for Mainnet chain", async () => {
        let balance = await mainnetChain.ethBalance(address);
        balance.should.be.a('string');
    });

    it("Deposits ETH from Mainnet to sChain", async () => {
        let mainnetBalanceBefore = await mainnetChain.ethBalance(address);
        let sChainBalanceBefore = await sChain.ethBalance(address);
        let sChainBalanceBeforeBN = mainnetChain.web3.utils.toBN(sChainBalanceBefore);
        let expectedSChainBalance = sChainBalanceBeforeBN.add(transferValBN);

        let txOpts: TxOpts = {
            value: test_utils.TEST_WEI_TRANSFER_VALUE,
            address: address,
            privateKey: test_utils.MAINNET_PRIVATE_KEY
        };

        await mainnetChain.depositETHtoSChain(
            test_utils.CHAIN_NAME_SCHAIN,
            address,
            txOpts
        );

        await test_utils.sleep(10000);

        let sChainBalanceAfter = await sChain.ethBalance(address);
        let mainnetBalanceAfter = await mainnetChain.ethBalance(address);
        
        console.log(mainnetBalanceBefore, mainnetBalanceAfter);
        console.log(sChainBalanceBefore, sChainBalanceAfter);

        sChainBalanceAfter.should.be.equal(expectedSChainBalance.toString(10));
    });

    it("Tests reimbursement wallet deposit/withdraw/balance", async () => {
        let balanceBefore = await mainnetChain.reimbursementWalletBalance(
            test_utils.CHAIN_NAME_SCHAIN, address);

        let balanceBeforeBN = mainnetChain.web3.utils.toBN(balanceBefore);
        let expectedBalanceBN = balanceBeforeBN.add(transferValBN);

        let balanceAfter = await mainnetChain.reimbursementWalletBalance(
            test_utils.CHAIN_NAME_SCHAIN, address);

        balanceAfter.should.be.equal(expectedBalanceBN.toString(10));

        await mainnetChain.reimbursementWalletWithdraw(
            test_utils.CHAIN_NAME_SCHAIN,
            test_utils.TEST_WEI_TRANSFER_VALUE,
            {
                address: address,
                privateKey: test_utils.MAINNET_PRIVATE_KEY
            }
        );

        let balanceAfterWithdraw = await mainnetChain.reimbursementWalletBalance(
            test_utils.CHAIN_NAME_SCHAIN, address);
        balanceAfterWithdraw.should.be.equal(balanceBefore);
    });
});
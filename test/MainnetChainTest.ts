import { Wallet } from "ethers";

import debug from 'debug';

import chaiAsPromised from "chai-as-promised";
import * as chai from 'chai';
import * as dotenv from "dotenv";

import { IMA } from '../src/index';
import MainnetChain from '../src/MainnetChain';
import SChain from '../src/SChain';

import * as test_utils from './test_utils';
import TxOpts from "../src/TxOpts";


dotenv.config();

chai.should();
chai.use(chaiAsPromised);
let expect = require('chai').expect;

const log = debug('ima:test:MainnetChain');


describe("Mainnet chain tests", () => {
    let wallet: Wallet;
    let mainnet: MainnetChain;
    let sChain: SChain;

    let opts: TxOpts;
    let ima: IMA;

    before(async () => {
        ima = test_utils.initTestIMA();
        mainnet = test_utils.initTestMainnet();
        sChain = test_utils.initTestSChain();

        wallet = new Wallet(test_utils.MAINNET_PRIVATE_KEY);

        opts = {
            address: wallet.address,
            privateKey: test_utils.SCHAIN_PRIVATE_KEY
        };

        await test_utils.grantPermissions(ima);
        const isChainConnected = await ima.mainnet.messageProxy.isChainConnected(
            test_utils.CHAIN_NAME_SCHAIN);
        if (!isChainConnected) {
            await ima.connectSchain(test_utils.CHAIN_NAME_SCHAIN, opts);
        }
        await ima.schain.communityLocker.setTimeLimitPerMessage(1, opts);
        await test_utils.reimburseWallet(ima);
    });

    it("Requests ETH balance for Mainnet chain", async () => {
        let balance = await mainnet.ethBalance(wallet.address);
        (typeof balance === 'bigint').should.be.equal(true);
    });

    it("Deposits ETH from Mainnet to sChain", async () => {
        let mainnetBalanceBefore = await mainnet.ethBalance(wallet.address);
        let sChainBalanceBefore: bigint = await sChain.ethBalance(wallet.address);
        let expectedSChainBalance: bigint = sChainBalanceBefore + test_utils.TEST_WEI_TRANSFER_VALUE;

        let txOpts: TxOpts = {
            value: test_utils.TEST_WEI_TRANSFER_VALUE,
            address: wallet.address,
            privateKey: test_utils.MAINNET_PRIVATE_KEY
        };
        await mainnet.eth.deposit(
            test_utils.CHAIN_NAME_SCHAIN,
            txOpts
        );
        await sChain.waitETHBalanceChange(wallet.address, sChainBalanceBefore);

        let sChainBalanceAfter = await sChain.ethBalance(wallet.address);
        let mainnetBalanceAfter = await mainnet.ethBalance(wallet.address);

        log('mainnet: ' + mainnetBalanceBefore + ' -> ' + mainnetBalanceAfter);
        log('schain: ' + sChainBalanceBefore + ' -> ' + sChainBalanceAfter);

        expect(sChainBalanceAfter).to.equal(expectedSChainBalance);
    });

    it("Tests reimbursement wallet deposit/withdraw/balance", async () => {
        let balanceBefore = await mainnet.communityPool.balance(
            wallet.address, test_utils.CHAIN_NAME_SCHAIN);

        let expectedBalance = balanceBefore + test_utils.TEST_WEI_TRANSFER_VALUE;

        await mainnet.communityPool.recharge(
            test_utils.CHAIN_NAME_SCHAIN,
            wallet.address,
            {
                value: test_utils.TEST_WEI_TRANSFER_VALUE,
                address: wallet.address,
                privateKey: test_utils.MAINNET_PRIVATE_KEY
            }
        );

        let balanceAfter = await mainnet.communityPool.balance(
            wallet.address,
            test_utils.CHAIN_NAME_SCHAIN
        );
        (balanceAfter === expectedBalance).should.be.true;

        await mainnet.communityPool.withdraw(
            test_utils.CHAIN_NAME_SCHAIN,
            test_utils.TEST_WEI_TRANSFER_VALUE,
            {
                address: wallet.address,
                privateKey: test_utils.MAINNET_PRIVATE_KEY
            }
        );

        let balanceAfterWithdraw = await mainnet.communityPool.balance(
            wallet.address,
            test_utils.CHAIN_NAME_SCHAIN
        );
        (balanceAfterWithdraw === balanceBefore).should.be.true;
    });
});
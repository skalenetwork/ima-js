import { Wallet } from "ethers";

import debug from 'debug';
import { expect } from 'chai';
import chaiAsPromised from "chai-as-promised";
import * as chai from 'chai';
import * as dotenv from "dotenv";

import TxOpts from "../src/TxOpts";
import { IMA } from '../src/index';

import * as test_utils from './test_utils';


dotenv.config();

chai.should();
chai.use(chaiAsPromised);

const log = debug('ima:test:sChain');


describe("sChain module tests", () => {
    let wallet: Wallet;
    let ima: IMA;
    let transferVal: bigint;

    before(async () => {
        ima = test_utils.initTestIMA();
        wallet = new Wallet(test_utils.MAINNET_PRIVATE_KEY);
        const opts = {
            address: wallet.address,
            privateKey: test_utils.SCHAIN_PRIVATE_KEY
        };
        transferVal = test_utils.TEST_WEI_TRANSFER_VALUE;

        await test_utils.grantPermissions(ima);
        if (!await ima.mainnet.messageProxy.isChainConnected(test_utils.CHAIN_NAME_SCHAIN)) {
            await ima.connectSchain(test_utils.CHAIN_NAME_SCHAIN, opts);
        }
        await ima.schain.communityLocker.setTimeLimitPerMessage(1, opts);
        await test_utils.reimburseWallet(ima);
    });

    it("Requests ERC20 ETH balance for sChain", async () => {
        let balance = await ima.schain.ethBalance(wallet.address);
        (typeof balance === 'bigint').should.be.true;
    });

    it("Withdraws ETH from sChain to Mainnet", async () => {
        let txOpts: TxOpts = {
            value: test_utils.TEST_WEI_TRANSFER_VALUE,
            address: wallet.address,
            privateKey: test_utils.SCHAIN_PRIVATE_KEY
        };

        let mainnetBalanceBefore = await ima.mainnet.ethBalance(wallet.address);
        let sChainBalanceBefore = await ima.schain.ethBalance(wallet.address);

        await ima.mainnet.communityPool.recharge(
            test_utils.CHAIN_NAME_SCHAIN,
            wallet.address,
            txOpts
        );

        await ima.mainnet.eth.deposit(
            test_utils.CHAIN_NAME_SCHAIN,
            txOpts
        );

        await ima.schain.waitETHBalanceChange(wallet.address, sChainBalanceBefore);

        let mainnetBalanceAfterDeposit = await ima.mainnet.ethBalance(wallet.address);
        let sChainBalanceAfterDeposit = await ima.schain.ethBalance(wallet.address);

        let lockedETHAmount = await ima.mainnet.eth.lockedETHAmount(wallet.address);

        await ima.schain.eth.withdraw(
            test_utils.TEST_WEI_TRANSFER_VALUE,
            {
                address: wallet.address,
                privateKey: test_utils.SCHAIN_PRIVATE_KEY
            }
        );

        await ima.mainnet.eth.waitLockedETHAmountChange(wallet.address, lockedETHAmount);
        await ima.mainnet.eth.getMyEth(
            {
                address: wallet.address,
                privateKey: test_utils.SCHAIN_PRIVATE_KEY
            }
        );

        let sChainBalanceAfterWithdraw = await ima.schain.ethBalance(wallet.address);
        let mainnetBalanceAfterWithdraw = await ima.mainnet.ethBalance(wallet.address);

        log('mainnetBalanceBefore: ' + mainnetBalanceBefore);
        log('mainnetBalanceAfterDeposit: ' + mainnetBalanceAfterDeposit);
        log('mainnetBalanceAfterWithdraw: ' + mainnetBalanceAfterWithdraw);

        log('sChainBalanceBefore: ' + sChainBalanceBefore);
        log('sChainBalanceAfterDeposit: ' + sChainBalanceAfterDeposit);
        log('sChainBalanceAfterWithdraw: ' + sChainBalanceAfterWithdraw);

        expect(sChainBalanceBefore).to.equal(sChainBalanceAfterWithdraw);
        expect(sChainBalanceBefore).to.not.equal(sChainBalanceAfterDeposit);
    });

    it("Tests enableAutomaticDeploy/disableAutomaticDeploy", async () => {
        let txOpts: TxOpts = {
            address: wallet.address,
            privateKey: test_utils.SCHAIN_PRIVATE_KEY
        };
        let automaticDeploy;
        automaticDeploy = await ima.schain.erc721.automaticDeploy();
        automaticDeploy.should.be.equal(false);
        await ima.schain.erc721.enableAutomaticDeploy(txOpts);
        automaticDeploy = await ima.schain.erc721.automaticDeploy();
        automaticDeploy.should.be.equal(true);
        await ima.schain.erc721.disableAutomaticDeploy(txOpts);
        automaticDeploy = await ima.schain.erc721.automaticDeploy();
        automaticDeploy.should.be.equal(false);
    });

    it.skip("Transfers ERC20 between chains", async () => {
        let txOpts: TxOpts = {
            address: wallet.address,
            privateKey: test_utils.SCHAIN_PRIVATE_KEY
        };
        await ima.schain.erc20.enableAutomaticDeploy(txOpts);
        await ima.schain.erc20.transferToSchain(
            'chainB',
            '0x1',
            '10000',
            txOpts
        );
    });

    it.skip("Transfers ERC721 between chains", async () => {
        let txOpts: TxOpts = {
            address: wallet.address,
            privateKey: test_utils.SCHAIN_PRIVATE_KEY
        };
        await ima.schain.erc721.enableAutomaticDeploy(txOpts);
        await ima.schain.erc721.transferToSchain(
            'chainB',
            '0x1',
            1,
            txOpts
        );
    });

    it.skip("Transfers ERC1155 between chains", async () => {
        let txOpts: TxOpts = {
            address: wallet.address,
            privateKey: test_utils.SCHAIN_PRIVATE_KEY
        };
        await ima.schain.erc1155.transferToSchain(
            'chainB',
            '0x1',
            1,
            '100',
            txOpts
        );
    });
});

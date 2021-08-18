import chaiAsPromised from "chai-as-promised";
import chai = require("chai");
import * as dotenv from "dotenv";

import TxOpts from "../src/TxOpts";
import TokenType from '../src/TokenType';
import IMA from '../src/index';

import * as helper from '../src/helper';
import * as test_utils from './test_utils';
import { test } from "mocha";


dotenv.config();

chai.should();
chai.use(chaiAsPromised);


describe("sChain module tests", () => {
    let address: string;
    let ima: IMA;
    let transferValBN: any;

    before(async () => {
        ima = test_utils.initTestIMA();
        address = helper.privateKeyToAddress(ima.schain.web3, test_utils.SCHAIN_PRIVATE_KEY);
        transferValBN = ima.mainnet.web3.utils.toBN(test_utils.TEST_WEI_TRANSFER_VALUE);
        await test_utils.grantPermissions(ima);
        await ima.schain.setTimeLimitPerMessage(1, {
            address: address,
            privateKey: test_utils.SCHAIN_PRIVATE_KEY
        });
        await test_utils.reimburseWallet(ima);
    });

    it("Requests ERC20 ETH balance for sChain", async () => {
        let balance = await ima.schain.ethBalance(address);
        balance.should.be.a('string');
    });

    it("Withdraws ETH from sChain to Mainnet", async () => {
        let txOpts: TxOpts = {
            value: test_utils.TEST_WEI_TRANSFER_VALUE,
            address: address,
            privateKey: test_utils.SCHAIN_PRIVATE_KEY
        };

        let mainnetBalanceBefore = await ima.mainnet.ethBalance(address);
        let sChainBalanceBefore = await ima.schain.ethBalance(address);

         await ima.mainnet.reimbursementWalletRecharge(
            test_utils.CHAIN_NAME_SCHAIN,
            txOpts
        );

        await ima.mainnet.depositETHtoSChain(
            test_utils.CHAIN_NAME_SCHAIN,
            address,
            txOpts
        );
        await test_utils.sleep(10000);
        let mainnetBalanceAfterDeposit = await ima.mainnet.ethBalance(address);
        let sChainBalanceAfterDeposit = await ima.schain.ethBalance(address);

        await ima.schain.withdrawETH(
            address,
            test_utils.TEST_WEI_TRANSFER_VALUE,
            {
                address: address,
                privateKey: test_utils.SCHAIN_PRIVATE_KEY
            }
        );

        await test_utils.sleep(10000);
        await ima.mainnet.getMyEth(
            {
                address: address,
                privateKey: test_utils.SCHAIN_PRIVATE_KEY
            }
        );

        let sChainBalanceAfterWithdraw = await ima.schain.ethBalance(address);
        let mainnetBalanceAfterWithdraw = await ima.mainnet.ethBalance(address);

        console.log(mainnetBalanceBefore, mainnetBalanceAfterDeposit, mainnetBalanceAfterWithdraw);
        console.log(sChainBalanceBefore, sChainBalanceAfterDeposit, sChainBalanceAfterWithdraw);

        sChainBalanceBefore.should.be.equal(sChainBalanceAfterWithdraw);
        
        let mainnetBalanceAfterDepositBN = ima.mainnet.web3.utils.toBN(mainnetBalanceAfterDeposit);
        let expectedMainnetBalanceAfterWithdraw = mainnetBalanceAfterDepositBN.add(transferValBN);

        // TODO: improve test - check mainnet balance after!
        // mainnetBalanceAfterWithdraw.should.be.equal(expectedMainnetBalanceAfterWithdraw.toString(10));
    });

    it("Tests enableAutomaticDeploy/disableAutomaticDeploy", async () => {
        let txOpts: TxOpts = {
            address: address,
            privateKey: test_utils.SCHAIN_PRIVATE_KEY
        };
        let automaticDeploy;
        automaticDeploy = await ima.schain.automaticDeploy(TokenType.ERC20);
        automaticDeploy.should.be.equal(false);
        await ima.schain.enableAutomaticDeploy(TokenType.ERC20, txOpts);
        automaticDeploy = await ima.schain.automaticDeploy(TokenType.ERC20);
        automaticDeploy.should.be.equal(true);
        await ima.schain.disableAutomaticDeploy(TokenType.ERC20, txOpts);
        automaticDeploy = await ima.schain.automaticDeploy(TokenType.ERC20);
        automaticDeploy.should.be.equal(false);
    });
});

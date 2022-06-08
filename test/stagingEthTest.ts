import chaiAsPromised from "chai-as-promised";
import chai = require("chai");
import * as dotenv from "dotenv";

import TxOpts from "../src/TxOpts";
import { IMA } from '../src/index';

import * as helper from '../src/helper';
import * as test_utils from './test_utils';


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
        await test_utils.reimburseWallet(ima);
    });

    it("Withdraws ETH from sChain to Mainnet", async () => {
        let txOpts: TxOpts = {
            value: test_utils.TEST_WEI_TRANSFER_VALUE,
            address: address,
            privateKey: test_utils.SCHAIN_PRIVATE_KEY
        };

        let mainnetBalanceBefore = await ima.mainnet.ethBalance(address);
        let sChainBalanceBefore = await ima.schain.ethBalance(address);

        await ima.mainnet.communityPool.recharge(
            test_utils.CHAIN_NAME_SCHAIN,
            address,
            txOpts
        );

        await ima.mainnet.eth.deposit(
            test_utils.CHAIN_NAME_SCHAIN,
            txOpts
        );
        await ima.schain.waitETHBalanceChange(address, sChainBalanceBefore);

        let mainnetBalanceAfterDeposit = await ima.mainnet.ethBalance(address);
        let sChainBalanceAfterDeposit = await ima.schain.ethBalance(address);

        let lockedETHAmount = await ima.mainnet.eth.lockedETHAmount(address);

        await ima.schain.eth.withdraw(
            test_utils.TEST_WEI_TRANSFER_VALUE,
            {
                address: address,
                privateKey: test_utils.SCHAIN_PRIVATE_KEY
            }
        );

        await ima.mainnet.eth.waitLockedETHAmountChange(address, lockedETHAmount);
        await ima.mainnet.eth.getMyEth(
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
});

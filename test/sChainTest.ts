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

        const opts = {
            address: address,
            privateKey: test_utils.SCHAIN_PRIVATE_KEY
        };

        await test_utils.grantPermissions(ima);
        if (!await ima.mainnet.messageProxyMainnet.isChainConnected(test_utils.CHAIN_NAME_SCHAIN)){
            await ima.connectSchain(test_utils.CHAIN_NAME_SCHAIN, opts);
        }
        await ima.schain.communityLocker.setTimeLimitPerMessage(1, opts);
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

    it("Tests enableAutomaticDeploy/disableAutomaticDeploy", async () => {
        let txOpts: TxOpts = {
            address: address,
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
            address: address,
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
            address: address,
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
            address: address,
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

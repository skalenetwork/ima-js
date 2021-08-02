import chaiAsPromised from "chai-as-promised";
import chai = require("chai");
import * as dotenv from "dotenv";

import MainnetChain from '../src/MainnetChain';
import SChain from '../src/SChain';
import TxOpts from "../src/TxOpts";
import TokenType from '../src/TokenType';

import * as helper from '../src/helper';
import * as test_utils from './test_utils';


dotenv.config();

chai.should();
chai.use(chaiAsPromised);


describe("sChain module tests", () => {
    let address: string;
    let mainnetChain: MainnetChain;
    let sChain: SChain;
    let transferValBN: any;

    before(async () => {
        mainnetChain = test_utils.initTestMainnet();
        sChain = test_utils.initTestSChain();
        address = helper.privateKeyToAddress(sChain.web3, test_utils.SCHAIN_PRIVATE_KEY);
        transferValBN = mainnetChain.web3.utils.toBN(test_utils.TEST_WEI_TRANSFER_VALUE);
    });

    it("Requests ERC20 ETH balance for sChain", async () => {
        let balance = await sChain.ethBalance(address);
        balance.should.be.a('string');
    });

    it("Withdraws ETH from sChain to Mainnet", async () => {
        let txOpts: TxOpts = {
            value: test_utils.TEST_WEI_TRANSFER_VALUE,
            address: address,
            privateKey: test_utils.SCHAIN_PRIVATE_KEY
        };

        let mainnetBalanceBefore = await mainnetChain.ethBalance(address);
        let sChainBalanceBefore = await sChain.ethBalance(address);

        await mainnetChain.depositETHtoSChain(
            test_utils.CHAIN_NAME_SCHAIN,
            address,
            txOpts
        );
        await test_utils.sleep(10000);
        let mainnetBalanceAfterDeposit = await mainnetChain.ethBalance(address);
        let sChainBalanceAfterDeposit = await sChain.ethBalance(address);

        await sChain.withdrawETH(
            address,
            test_utils.TEST_WEI_TRANSFER_VALUE,
            {
                address: address,
                privateKey: test_utils.SCHAIN_PRIVATE_KEY
            }
        );

        await test_utils.sleep(10000);
        await mainnetChain.getMyEth(
            {
                address: address,
                privateKey: test_utils.SCHAIN_PRIVATE_KEY
            }
        );

        let sChainBalanceAfterWithdraw = await sChain.ethBalance(address);
        let mainnetBalanceAfterWithdraw = await mainnetChain.ethBalance(address);

        console.log(mainnetBalanceBefore, mainnetBalanceAfterDeposit, mainnetBalanceAfterWithdraw);
        console.log(sChainBalanceBefore, sChainBalanceAfterDeposit, sChainBalanceAfterWithdraw);

        sChainBalanceBefore.should.be.equal(sChainBalanceAfterWithdraw);
        
        let mainnetBalanceAfterDepositBN = mainnetChain.web3.utils.toBN(mainnetBalanceAfterDeposit);
        let expectedMainnetBalanceAfterWithdraw = mainnetBalanceAfterDepositBN.add(transferValBN);

        // TODO: improve test - check mainnet balance after!
        // mainnetBalanceAfterWithdraw.should.be.equal(expectedMainnetBalanceAfterWithdraw.toString(10));
    });

    it.only("Tests enableAutomaticDeploy/disableAutomaticDeploy", async () => {
        let txOpts: TxOpts = {
            address: address,
            privateKey: test_utils.SCHAIN_PRIVATE_KEY
        };
        let automaticDeploy;

        automaticDeploy = await sChain.automaticDeploy(TokenType.ERC20);
        automaticDeploy.should.be.equal(false);
        await sChain.enableAutomaticDeploy(TokenType.ERC20, txOpts);
        automaticDeploy = await sChain.automaticDeploy(TokenType.ERC20);
        automaticDeploy.should.be.equal(true);
        await sChain.disableAutomaticDeploy(TokenType.ERC20, txOpts);
        automaticDeploy = await sChain.automaticDeploy(TokenType.ERC20);
        automaticDeploy.should.be.equal(false);
    });
});

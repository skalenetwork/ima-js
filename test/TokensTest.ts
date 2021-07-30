import chaiAsPromised from "chai-as-promised";
import chai = require("chai");
import * as dotenv from "dotenv";

import IMA from '../src/index';
import TxOpts from "../src/TxOpts";

import * as helper from '../src/helper';
import * as constants from '../src/constants';
import * as test_utils from './test_utils';


dotenv.config();

chai.should();
chai.use(chaiAsPromised);


describe("ERC20/ERC721 tokens tests", () => {
    let address: string;
    let ima: IMA;
    let erc20Name: string;

    before(async () => {
        ima = test_utils.initTestIMA();
        address = helper.privateKeyToAddress(ima.schain.web3, test_utils.SCHAIN_PRIVATE_KEY);
        erc20Name = 'testERC20';
    });

    it.only("Test ERC20 deposit/withdraw", async () => {
        let txOpts: TxOpts = {
            address: address,
            privateKey: test_utils.SCHAIN_PRIVATE_KEY
        };

        const testTokens = test_utils.initTestTokens(ima.mainnet.web3, ima.schain.web3);

        ima.addERC20token(erc20Name, testTokens.mainnetERC20, testTokens.sChainERC20);
        // await ima.linkERC20Token(
        //     test_utils.CHAIN_NAME_SCHAIN,
        //     testTokens.mainnetERC20.options.address,
        //     testTokens.sChainERC20.options.address,
        //     txOpts
        // )

        const erc20balanceMainnet1 = await ima.mainnet.getERC20balance(erc20Name, address);
        const erc20balanceSChain1 = await ima.schain.getERC20balance(erc20Name, address);

        console.log(erc20balanceMainnet1, erc20balanceSChain1);

        await ima.mainnet.approveERC20Transfers(erc20Name, constants.MAX_APPROVAL_AMOUNT, txOpts);
        await ima.mainnet.depositERC20(test_utils.CHAIN_NAME_SCHAIN, erc20Name, address,
            test_utils.TEST_TOKENS_TRANSFER_VALUE, txOpts);
    
        await test_utils.sleep(15000);

        const erc20balanceMainnet2 = await ima.mainnet.getERC20balance(erc20Name, address);
        const erc20balanceSChain2 = await ima.schain.getERC20balance(erc20Name, address);

        console.log(erc20balanceMainnet2, erc20balanceSChain2);
        // todo: add assert here

        await ima.schain.approveERC20Transfers(erc20Name, constants.MAX_APPROVAL_AMOUNT, txOpts);
        console.log('approved!')
        await ima.schain.withdrawERC20(erc20Name, address, test_utils.TEST_TOKENS_TRANSFER_VALUE,
            txOpts);

        await test_utils.sleep(15000);
        
        const erc20balanceMainnet3 = await ima.mainnet.getERC20balance(erc20Name, address);
        const erc20balanceSChain3 = await ima.schain.getERC20balance(erc20Name, address);

        console.log(erc20balanceMainnet3, erc20balanceSChain3);
        // todo: add assert here
    });

});

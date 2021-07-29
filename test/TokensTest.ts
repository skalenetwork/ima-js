import chaiAsPromised from "chai-as-promised";
import chai = require("chai");
import * as dotenv from "dotenv";

import IMA from '../src/index';
import TxOpts from "../src/TxOpts";

import * as helper from '../src/helper';
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
        const testTokens = test_utils.initTestTokens(ima.mainnet.web3, ima.schain.web3);

        ima.addERC20token(erc20Name, testTokens.mainnetERC20, testTokens.sChainERC20);

        const erc20balanceMainnet1 = await ima.mainnet.getERC20balance(erc20Name, address);
        const erc20balanceSChain1 = await ima.schain.getERC20balance(erc20Name, address);

        console.log(erc20balanceMainnet1, erc20balanceSChain1);
    });

});

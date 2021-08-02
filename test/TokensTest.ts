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
    let erc721Name: string;
    let erc721TokenId: number;

    before(async () => {
        ima = test_utils.initTestIMA();
        address = helper.privateKeyToAddress(ima.schain.web3, test_utils.SCHAIN_PRIVATE_KEY);
        erc20Name = 'testERC20';
        erc721Name = 'testERC721';
        erc721TokenId = 1;        
    });

    it("Test ERC20 deposit/withdraw", async () => {
        let txOpts: TxOpts = {
            address: address,
            privateKey: test_utils.SCHAIN_PRIVATE_KEY
        };

        const testTokens = test_utils.initTestTokens(ima.mainnet.web3, ima.schain.web3);

        ima.addERC20Token(erc20Name, testTokens.mainnetERC20, testTokens.sChainERC20);

        // await ima.linkERC20Token(
        //     test_utils.CHAIN_NAME_SCHAIN,
        //     testTokens.mainnetERC20.options.address,
        //     testTokens.sChainERC20.options.address,
        //     txOpts
        // )

        const erc20balanceMainnet1 = await ima.mainnet.getERC20Balance(erc20Name, address);
        const erc20balanceSChain1 = await ima.schain.getERC20Balance(erc20Name, address);

        console.log(erc20balanceMainnet1, erc20balanceSChain1);

        await ima.mainnet.approveERC20Transfers(erc20Name, constants.MAX_APPROVAL_AMOUNT, txOpts);
        await ima.depositERC20(test_utils.CHAIN_NAME_SCHAIN, erc20Name, address,
            test_utils.TEST_TOKENS_TRANSFER_VALUE, txOpts);
    
        await test_utils.sleep(15000);

        const erc20balanceMainnet2 = await ima.mainnet.getERC20Balance(erc20Name, address);
        const erc20balanceSChain2 = await ima.schain.getERC20Balance(erc20Name, address);

        console.log(erc20balanceMainnet2, erc20balanceSChain2);
        // todo: add balance assert here

        await ima.schain.approveERC20Transfers(erc20Name, constants.MAX_APPROVAL_AMOUNT, txOpts);
        await ima.withdrawERC20(erc20Name, address, test_utils.TEST_TOKENS_TRANSFER_VALUE,
            txOpts);

        await test_utils.sleep(15000);
        
        const erc20balanceMainnet3 = await ima.mainnet.getERC20Balance(erc20Name, address);
        const erc20balanceSChain3 = await ima.schain.getERC20Balance(erc20Name, address);

        console.log(erc20balanceMainnet3, erc20balanceSChain3);
        // todo: add balance assert here
    });


    it("Test ERC721 deposit/withdraw", async () => {
        let txOpts: TxOpts = {
            address: address,
            privateKey: test_utils.SCHAIN_PRIVATE_KEY
        };

        const testTokens = test_utils.initTestTokens(ima.mainnet.web3, ima.schain.web3);
        ima.addERC721Token(erc721Name, testTokens.mainnetERC721, testTokens.sChainERC721);

        // await ima.linkERC721Token(
        //     test_utils.CHAIN_NAME_SCHAIN,
        //     testTokens.mainnetERC721.options.address,
        //     testTokens.sChainERC721.options.address,
        //     txOpts
        // );

        const erc721OwnerMainnet1 = await ima.mainnet.getERC721OwnerOf(erc721Name, erc721TokenId);
        const erc721OwnerSchain1 = await ima.schain.getERC721OwnerOf(erc721Name, erc721TokenId);

        console.log(erc721OwnerMainnet1);
        console.log(erc721OwnerSchain1);

        await ima.mainnet.approveERC721Transfer(erc721Name, erc721TokenId, txOpts);
        await ima.depositERC721(test_utils.CHAIN_NAME_SCHAIN, erc721Name, address,
            erc721TokenId, txOpts);

        await test_utils.sleep(15000);

        const erc721OwnerMainnet2 = await ima.mainnet.getERC721OwnerOf(erc721Name, erc721TokenId);
        const erc721OwnerSchain2 = await ima.schain.getERC721OwnerOf(erc721Name, erc721TokenId);
        
        console.log(erc721OwnerMainnet2);
        console.log(erc721OwnerSchain2);

        await ima.schain.approveERC721Transfer(erc721Name, erc721TokenId, txOpts);
        await ima.withdrawERC721(erc721Name, address, erc721TokenId, txOpts);

        await test_utils.sleep(15000);
        
        const erc721OwnerMainnet3 = await ima.mainnet.getERC721OwnerOf(erc721Name, erc721TokenId);
        const erc721OwnerSchain3 = await ima.schain.getERC721OwnerOf(erc721Name, erc721TokenId);
        
        console.log(erc721OwnerMainnet3);
        console.log(erc721OwnerSchain3);

    });

});
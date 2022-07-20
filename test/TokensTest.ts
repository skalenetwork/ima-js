import chaiAsPromised from "chai-as-promised";
import chai = require("chai");
import * as dotenv from "dotenv";

import { IMA } from '../src/index';
import TxOpts from "../src/TxOpts";
import { ContractsStringMap } from '../src/BaseChain';

import * as helper from '../src/helper';
import * as constants from '../src/constants';
import * as test_utils from './test_utils';
import { ZERO_ADDRESS } from "../src/constants";
import { exit } from "process";


dotenv.config();

chai.should();
chai.use(chaiAsPromised);

const assertArrays = require('chai-arrays');
chai.use(assertArrays);
let expect = require('chai').expect;


describe("ERC20/ERC721/ERC1155 tokens tests", () => {
    let opts: TxOpts;
    let testTokens: ContractsStringMap;

    let address: string;
    let ima: IMA;
    let erc20Name: string;

    let erc721Name: string;
    let erc721TokenId: number;

    let erc1155Name: string;
    let erc1155TokenId: number;
    
    let erc1155TokenIds: Array<number>;
    let erc1155Amounts: Array<string>;

    before(async () => {
        ima = test_utils.initTestIMA();
        address = helper.privateKeyToAddress(ima.schain.web3, test_utils.SCHAIN_PRIVATE_KEY);
        testTokens = test_utils.initTestTokens(ima.mainnet.web3, ima.schain.web3);
        opts = {
            address: address,
            privateKey: test_utils.SCHAIN_PRIVATE_KEY
        };

        erc20Name = 'testERC20';
        
        erc721Name = 'testERC721';
        erc721TokenId = 1;

        erc1155TokenId = 1;
        erc1155Name = 'testERC1155';
        erc1155TokenIds = [1, 2, 3];
        erc1155Amounts = ['1000', '2000', '3000'];

        await test_utils.grantPermissions(ima);
        if (!await ima.mainnet.messageProxy.isChainConnected(test_utils.CHAIN_NAME_SCHAIN)){
            await ima.connectSchain(test_utils.CHAIN_NAME_SCHAIN, opts);
        }
        await ima.schain.communityLocker.setTimeLimitPerMessage(1, opts);
        await test_utils.reimburseWallet(ima);
    });

    it("Test ERC20 approve/balance/deposit/withdraw", async () => {
        ima.addERC20Token(erc20Name, testTokens.mainnetERC20, testTokens.schainERC20);

        await ima.linkERC20Token(
            test_utils.CHAIN_NAME_SCHAIN,
            test_utils.MAINNET_CHAIN_NAME,
            testTokens.mainnetERC20.options.address,
            testTokens.schainERC20.options.address,
            opts
        )

        const balanceMainnet1 = await ima.mainnet.getERC20Balance(testTokens.mainnetERC20, address);
        const balanceSchain1 = await ima.schain.getERC20Balance(testTokens.schainERC20, address);

        await ima.mainnet.erc20.approve(erc20Name, constants.MAX_APPROVAL_AMOUNT, opts);
        await ima.depositERC20(test_utils.CHAIN_NAME_SCHAIN, erc20Name,
            test_utils.TEST_TOKENS_TRANSFER_VALUE, opts);
    
        await ima.schain.waitERC20BalanceChange(testTokens.schainERC20, address, balanceSchain1);

        const balanceMainnet2 = await ima.mainnet.getERC20Balance(testTokens.mainnetERC20, address);
        const balanceSchain2 = await ima.schain.getERC20Balance(testTokens.schainERC20, address);

        let balanceMainnet1BN = ima.mainnet.web3.utils.toBN(balanceMainnet1);
        let balanceSchain1BN = ima.mainnet.web3.utils.toBN(balanceSchain1);
        let transferBN = ima.mainnet.web3.utils.toBN(test_utils.TEST_TOKENS_TRANSFER_VALUE);
        let expectedMainnetBalanceBN = balanceMainnet1BN.sub(transferBN);
        let expectedSchainBalanceBN = balanceSchain1BN.add(transferBN);

        balanceMainnet2.should.be.equal(expectedMainnetBalanceBN.toString());
        balanceSchain2.should.be.equal(expectedSchainBalanceBN.toString());

        await ima.schain.erc20.approve(erc20Name, constants.MAX_APPROVAL_AMOUNT, ima.schain.erc20.address, opts);
        await ima.withdrawERC20(erc20Name, test_utils.TEST_TOKENS_TRANSFER_VALUE,
             opts);

        await ima.mainnet.waitERC20BalanceChange(testTokens.mainnetERC20, address, balanceMainnet2);
        
        const balanceMainnet3 = await ima.mainnet.getERC20Balance(testTokens.mainnetERC20, address);
        const balanceSchain3 = await ima.schain.getERC20Balance(testTokens.schainERC20, address);

        balanceMainnet3.should.be.equal(balanceMainnet1);
        balanceSchain3.should.be.equal(balanceSchain1);
    });

    it("Test ERC20 tokens mapping", async () => {
        ima.addERC20Token(erc20Name, testTokens.mainnetERC20, testTokens.schainERC20);
        await ima.linkERC20Token(
            test_utils.CHAIN_NAME_SCHAIN,
            test_utils.MAINNET_CHAIN_NAME,
            testTokens.mainnetERC20.options.address,
            testTokens.schainERC20.options.address,
            opts
        );
        let erc20Len = await ima.mainnet.erc20.getTokenMappingsLength(test_utils.CHAIN_NAME_SCHAIN);
        erc20Len.should.be.equal('1');

        let erc20Tokens = await ima.mainnet.erc20.getTokenMappings(
            test_utils.CHAIN_NAME_SCHAIN, 0, erc20Len);
        erc20Tokens[0].should.be.equal(testTokens.mainnetERC20.options.address);
    });

    it("Test ERC721 tokens mapping", async () => {
        ima.addERC721Token(erc721Name, testTokens.mainnetERC721, testTokens.schainERC721);
        await ima.linkERC721Token(
            test_utils.CHAIN_NAME_SCHAIN,
            test_utils.MAINNET_CHAIN_NAME,
            testTokens.mainnetERC721.options.address,
            testTokens.schainERC721.options.address,
            opts
        );
        let erc721Len = await ima.mainnet.erc721.getTokenMappingsLength(
            test_utils.CHAIN_NAME_SCHAIN);
        erc721Len.should.be.equal('1');

        let erc721Tokens = await ima.mainnet.erc721.getTokenMappings(
            test_utils.CHAIN_NAME_SCHAIN, 0, erc721Len);
        erc721Tokens[0].should.be.equal(testTokens.mainnetERC721.options.address);
    });

    it("Test ERC1155 tokens mapping", async () => {
        ima.addERC1155Token(erc1155Name, testTokens.mainnetERC1155, testTokens.schainERC1155);
        await ima.linkERC1155Token(
            test_utils.CHAIN_NAME_SCHAIN,
            test_utils.MAINNET_CHAIN_NAME,
            testTokens.mainnetERC1155.options.address,
            testTokens.schainERC1155.options.address,
            opts
        );
        let erc1155Len = await ima.mainnet.erc1155.getTokenMappingsLength(
            test_utils.CHAIN_NAME_SCHAIN);
        erc1155Len.should.be.equal('1');

        let erc1155Tokens = await ima.mainnet.erc1155.getTokenMappings(
            test_utils.CHAIN_NAME_SCHAIN, 0, erc1155Len);
        erc1155Tokens[0].should.be.equal(testTokens.mainnetERC1155.options.address);
    });

    it("Test ERC721 approve/balance/deposit/withdraw", async () => {
        ima.addERC721Token(erc721Name, testTokens.mainnetERC721, testTokens.schainERC721);

        await ima.linkERC721Token(
            test_utils.CHAIN_NAME_SCHAIN,
            test_utils.MAINNET_CHAIN_NAME,
            testTokens.mainnetERC721.options.address,
            testTokens.schainERC721.options.address,
            opts
        );

        const erc721OwnerMainnet1 = await ima.mainnet.getERC721OwnerOf(testTokens.mainnetERC721, erc721TokenId);
        const erc721OwnerSchain1 = await ima.schain.getERC721OwnerOf(testTokens.schainERC721, erc721TokenId);
        const depositBoxAddress = ima.mainnet.erc721.address;

        if (erc721OwnerMainnet1 != depositBoxAddress) {
            await ima.mainnet.erc721.approve(erc721Name, erc721TokenId, opts);
        }
        await ima.depositERC721(test_utils.CHAIN_NAME_SCHAIN, erc721Name,
            erc721TokenId, opts);
        await ima.schain.waitERC721OwnerChange(testTokens.schainERC721, erc721TokenId, erc721OwnerSchain1);

        const erc721OwnerMainnet2 = await ima.mainnet.getERC721OwnerOf(testTokens.mainnetERC721, erc721TokenId);
        const erc721OwnerSchain2 = await ima.schain.getERC721OwnerOf(testTokens.schainERC721, erc721TokenId);

        erc721OwnerMainnet2.should.be.equal(ima.mainnet.erc721.address);
        erc721OwnerSchain2.should.be.equal(erc721OwnerMainnet1);

        await ima.schain.erc721.approve(erc721Name, erc721TokenId, opts);
        await ima.withdrawERC721(erc721Name, erc721TokenId, opts);
        await ima.mainnet.waitERC721OwnerChange(testTokens.mainnetERC721, erc721TokenId, erc721OwnerMainnet2);

        const erc721OwnerMainnet3 = await ima.mainnet.getERC721OwnerOf(testTokens.mainnetERC721, erc721TokenId);
        const erc721OwnerSchain3 = await ima.schain.getERC721OwnerOf(testTokens.schainERC721, erc721TokenId);

        erc721OwnerMainnet3.should.be.equal(address);
        erc721OwnerSchain3.should.be.equal(ZERO_ADDRESS);
    });

    it("Test ERC721 with metadata approve/balance/deposit/withdraw", async () => {        
        ima.addERC721WithMetadataToken(
            erc721Name,
            testTokens.mainnetERC721Meta,
            testTokens.schainERC721Meta
        );
        await ima.mainnet.setTokenURI(testTokens.mainnetERC721Meta, erc721TokenId, 'abcd', opts);
        await ima.linkERC721TokenWithMetadata(
            test_utils.CHAIN_NAME_SCHAIN,
            test_utils.MAINNET_CHAIN_NAME,
            testTokens.mainnetERC721Meta.options.address,
            testTokens.schainERC721Meta.options.address,
            opts
        );

        const erc721OwnerMainnet1 = await ima.mainnet.getERC721OwnerOf(testTokens.mainnetERC721Meta, erc721TokenId);
        const erc721OwnerSchain1 = await ima.schain.getERC721OwnerOf(testTokens.schainERC721Meta, erc721TokenId);
        const depositBoxAddress = ima.mainnet.erc721meta.address;

        if (erc721OwnerMainnet1 != depositBoxAddress) {
            await ima.mainnet.erc721meta.approve(erc721Name, erc721TokenId, opts);
        }
        await ima.depositERC721WithMetadata(test_utils.CHAIN_NAME_SCHAIN, erc721Name,
            erc721TokenId, opts);
        await ima.schain.waitERC721OwnerChange(testTokens.schainERC721Meta, erc721TokenId, erc721OwnerSchain1);

        const erc721OwnerMainnet2 = await ima.mainnet.getERC721OwnerOf(testTokens.mainnetERC721Meta, erc721TokenId);
        const erc721OwnerSchain2 = await ima.schain.getERC721OwnerOf(testTokens.schainERC721Meta, erc721TokenId);

        erc721OwnerMainnet2.should.be.equal(depositBoxAddress);
        erc721OwnerSchain2.should.be.equal(erc721OwnerMainnet1);
        
        await ima.schain.erc721meta.approve(erc721Name, erc721TokenId, opts);
        await ima.withdrawERC721Meta(erc721Name, erc721TokenId, opts);
        await ima.mainnet.waitERC721OwnerChange(testTokens.mainnetERC721Meta, erc721TokenId, erc721OwnerMainnet2);
        
        const erc721OwnerMainnet3 = await ima.mainnet.getERC721OwnerOf(testTokens.mainnetERC721Meta, erc721TokenId);
        const erc721OwnerSchain3 = await ima.schain.getERC721OwnerOf(testTokens.schainERC721Meta, erc721TokenId);
        
        erc721OwnerMainnet3.should.be.equal(address);
        erc721OwnerSchain3.should.be.equal(ZERO_ADDRESS);
    });

    it("Test ERC1155 approve/balance/deposit/withdraw", async () => {
        ima.addERC1155Token(erc1155Name, testTokens.mainnetERC1155, testTokens.schainERC1155);

        await ima.linkERC1155Token(
            test_utils.CHAIN_NAME_SCHAIN,
            test_utils.MAINNET_CHAIN_NAME,
            testTokens.mainnetERC1155.options.address,
            testTokens.schainERC1155.options.address,
            opts
        );

        const balancesMainnet1 = await test_utils.getERC1155Balances(ima.mainnet, testTokens.mainnetERC1155, address, erc1155TokenId);
        const balancesSchain1 = await test_utils.getERC1155Balances(ima.schain, testTokens.schainERC1155, address, erc1155TokenId);

        await ima.mainnet.erc1155.approveAll(erc1155Name, opts);

        await ima.depositERC1155(test_utils.CHAIN_NAME_SCHAIN, erc1155Name,
            erc1155TokenId, test_utils.TEST_TOKENS_TRANSFER_VALUE, opts);
        await ima.schain.waitERC1155BalanceChange(testTokens.schainERC1155, address, erc1155TokenId, balancesSchain1[0]);

        const balancesMainnet2 = await test_utils.getERC1155Balances(ima.mainnet, testTokens.mainnetERC1155, address, erc1155TokenId);
        const balancesSchain2 = await test_utils.getERC1155Balances(ima.schain, testTokens.schainERC1155, address, erc1155TokenId);

        balancesMainnet2[0].should.be.equal(String(Number(balancesMainnet1[0]) - Number(test_utils.TEST_TOKENS_TRANSFER_VALUE)));
        balancesSchain2[0].should.be.equal(String(Number(balancesSchain1[0]) + Number(test_utils.TEST_TOKENS_TRANSFER_VALUE)));

        await ima.schain.erc1155.approveAll(erc1155Name, erc1155TokenId, opts);
        await ima.withdrawERC1155(erc1155Name, erc1155TokenId,
            test_utils.TEST_TOKENS_TRANSFER_VALUE, opts);
        await ima.mainnet.waitERC1155BalanceChange(testTokens.mainnetERC1155, address, erc1155TokenId, balancesMainnet2[0]);

        const balancesMainnet3 = await test_utils.getERC1155Balances(ima.mainnet, testTokens.mainnetERC1155, address, erc1155TokenId);
        const balancesSchain3 = await test_utils.getERC1155Balances(ima.schain, testTokens.schainERC1155, address, erc1155TokenId);
        
        balancesMainnet3[0].should.be.equal(balancesMainnet1[0]);
        balancesSchain3[0].should.be.equal(balancesSchain1[0]);
    });

    it("Test ERC1155 batch deposit/withdraw", async () => {
        ima.addERC1155Token(erc1155Name, testTokens.mainnetERC1155, testTokens.schainERC1155);

        const balancesMainnet1 = await test_utils.getERC1155Balances(ima.mainnet, testTokens.mainnetERC1155, address, erc1155TokenIds);
        const balancesSchain1 = await test_utils.getERC1155Balances(ima.schain, testTokens.schainERC1155, address, erc1155TokenIds);

        await ima.depositERC1155(test_utils.CHAIN_NAME_SCHAIN, erc1155Name,
            erc1155TokenIds, erc1155Amounts, opts);
        await ima.schain.waitERC1155BalanceChange(testTokens.schainERC1155, address, erc1155TokenIds[0], balancesSchain1[0]);

        let expectedMainnetBalances = test_utils.subArrays(test_utils.toNumbers(balancesMainnet1), test_utils.toNumbers(erc1155Amounts));
        let expectedSchainBalances = test_utils.addArrays(test_utils.toNumbers(balancesSchain1), test_utils.toNumbers(erc1155Amounts));

        const balancesMainnet2 = await test_utils.getERC1155Balances(ima.mainnet, testTokens.mainnetERC1155, address, erc1155TokenIds);
        const balancesSchain2 = await test_utils.getERC1155Balances(ima.schain, testTokens.schainERC1155, address, erc1155TokenIds);

        expect(balancesMainnet2).to.be.equalTo(test_utils.toStrings(expectedMainnetBalances));
        expect(balancesSchain2).to.be.equalTo(test_utils.toStrings(expectedSchainBalances));

        await ima.withdrawERC1155(erc1155Name, erc1155TokenIds, erc1155Amounts, opts);
        await ima.mainnet.waitERC1155BalanceChange(testTokens.mainnetERC1155, address, erc1155TokenIds[0], balancesMainnet2[0]);

        const balancesMainnet3 = await test_utils.getERC1155Balances(ima.mainnet, testTokens.mainnetERC1155, address, erc1155TokenIds);
        const balancesSchain3 = await test_utils.getERC1155Balances(ima.schain, testTokens.schainERC1155, address, erc1155TokenIds);

        expect(balancesMainnet3).to.be.equalTo(balancesMainnet1);
        expect(balancesSchain3).to.be.equalTo(balancesSchain1);
    });

});
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
        if (!await ima.mainnet.isChainConnected(test_utils.CHAIN_NAME_SCHAIN)){
            await ima.connectSchain(test_utils.CHAIN_NAME_SCHAIN, opts);
        }
        await ima.schain.setTimeLimitPerMessage(1, {
            address: address,
            privateKey: test_utils.SCHAIN_PRIVATE_KEY
        });
        await test_utils.reimburseWallet(ima);
    });

    it("Test ERC20 approve/balance/deposit/withdraw", async () => {
        ima.addERC20Token(erc20Name, testTokens.mainnetERC20, testTokens.schainERC20);

        await ima.linkERC20Token(
            test_utils.CHAIN_NAME_SCHAIN,
            testTokens.mainnetERC20.options.address,
            testTokens.schainERC20.options.address,
            opts
        )

        const balanceMainnet1 = await ima.mainnet.getERC20Balance(erc20Name, address);
        const balanceSchain1 = await ima.schain.getERC20Balance(erc20Name, address);

        await ima.mainnet.approveERC20Transfers(erc20Name, constants.MAX_APPROVAL_AMOUNT, opts);
        await ima.depositERC20(test_utils.CHAIN_NAME_SCHAIN, erc20Name,
            test_utils.TEST_TOKENS_TRANSFER_VALUE, opts);
    
        await ima.schain.waitERC20BalanceChange(erc20Name, address, balanceSchain1);

        const balanceMainnet2 = await ima.mainnet.getERC20Balance(erc20Name, address);
        const balanceSchain2 = await ima.schain.getERC20Balance(erc20Name, address);

        let balanceMainnet1BN = ima.mainnet.web3.utils.toBN(balanceMainnet1);
        let balanceSchain1BN = ima.mainnet.web3.utils.toBN(balanceSchain1);
        let transferBN = ima.mainnet.web3.utils.toBN(test_utils.TEST_TOKENS_TRANSFER_VALUE);
        let expectedMainnetBalanceBN = balanceMainnet1BN.sub(transferBN);
        let expectedSchainBalanceBN = balanceSchain1BN.add(transferBN);

        balanceMainnet2.should.be.equal(expectedMainnetBalanceBN.toString());
        balanceSchain2.should.be.equal(expectedSchainBalanceBN.toString());

        await ima.schain.approveERC20Transfers(erc20Name, constants.MAX_APPROVAL_AMOUNT, opts);
        await ima.withdrawERC20(erc20Name, test_utils.TEST_TOKENS_TRANSFER_VALUE,
            opts);

        await ima.mainnet.waitERC20BalanceChange(erc20Name, address, balanceMainnet2);
        
        const balanceMainnet3 = await ima.mainnet.getERC20Balance(erc20Name, address);
        const balanceSchain3 = await ima.schain.getERC20Balance(erc20Name, address);

        balanceMainnet3.should.be.equal(balanceMainnet1);
        balanceSchain3.should.be.equal(balanceSchain1);
    });

    it("Test ERC721 approve/balance/deposit/withdraw", async () => {
        ima.addERC721Token(erc721Name, testTokens.mainnetERC721, testTokens.schainERC721);

        await ima.linkERC721Token(
            test_utils.CHAIN_NAME_SCHAIN,
            testTokens.mainnetERC721.options.address,
            testTokens.schainERC721.options.address,
            opts
        );

        const erc721OwnerMainnet1 = await ima.mainnet.getERC721OwnerOf(erc721Name, erc721TokenId);
        const erc721OwnerSchain1 = await ima.schain.getERC721OwnerOf(erc721Name, erc721TokenId);
        const depositBoxAddress = ima.mainnet.contracts.depositBoxERC721.options.address;

        if (erc721OwnerMainnet1 != depositBoxAddress) {
            await ima.mainnet.approveERC721Transfer(erc721Name, erc721TokenId, opts);
        }
        await ima.depositERC721(test_utils.CHAIN_NAME_SCHAIN, erc721Name,
            erc721TokenId, opts);
        await ima.schain.waitERC721OwnerChange(erc721Name, erc721TokenId, erc721OwnerSchain1);

        const erc721OwnerMainnet2 = await ima.mainnet.getERC721OwnerOf(erc721Name, erc721TokenId);
        const erc721OwnerSchain2 = await ima.schain.getERC721OwnerOf(erc721Name, erc721TokenId);

        erc721OwnerMainnet2.should.be.equal(ima.mainnet.contracts.depositBoxERC721.options.address);
        erc721OwnerSchain2.should.be.equal(erc721OwnerMainnet1);
        
        await ima.schain.approveERC721Transfer(erc721Name, erc721TokenId, opts);
        await ima.withdrawERC721(erc721Name, erc721TokenId, opts);
        await ima.mainnet.waitERC721OwnerChange(erc721Name, erc721TokenId, erc721OwnerMainnet2);
        
        const erc721OwnerMainnet3 = await ima.mainnet.getERC721OwnerOf(erc721Name, erc721TokenId);
        const erc721OwnerSchain3 = await ima.schain.getERC721OwnerOf(erc721Name, erc721TokenId);
        
        erc721OwnerMainnet3.should.be.equal(address);
        erc721OwnerSchain3.should.be.equal(ZERO_ADDRESS);
    });

    it("Test ERC1155 approve/balance/deposit/withdraw", async () => {
        ima.addERC1155Token(erc1155Name, testTokens.mainnetERC1155, testTokens.schainERC1155);

        await ima.linkERC1155Token(
            test_utils.CHAIN_NAME_SCHAIN,
            testTokens.mainnetERC1155.options.address,
            testTokens.schainERC1155.options.address,
            opts
        );

        const balancesMainnet1 = await test_utils.getERC1155Balances(ima.mainnet, erc1155Name, address, erc1155TokenId);
        const balancesSchain1 = await test_utils.getERC1155Balances(ima.schain, erc1155Name, address, erc1155TokenId);

        await ima.mainnet.approveAllERC1155(erc1155Name, opts);
        
        await ima.depositERC1155(test_utils.CHAIN_NAME_SCHAIN, erc1155Name,
            erc1155TokenId, test_utils.TEST_TOKENS_TRANSFER_VALUE, opts);
        await ima.schain.waitERC1155BalanceChange(erc1155Name, address, erc1155TokenId, balancesSchain1[0]);

        const balancesMainnet2 = await test_utils.getERC1155Balances(ima.mainnet, erc1155Name, address, erc1155TokenId);
        const balancesSchain2 = await test_utils.getERC1155Balances(ima.schain, erc1155Name, address, erc1155TokenId);

        balancesMainnet2[0].should.be.equal(String(Number(balancesMainnet1[0]) - Number(test_utils.TEST_TOKENS_TRANSFER_VALUE)));
        balancesSchain2[0].should.be.equal(String(Number(balancesSchain1[0]) + Number(test_utils.TEST_TOKENS_TRANSFER_VALUE)));

        await ima.schain.approveAllERC1155(erc1155Name, erc1155TokenId, opts);
        await ima.withdrawERC1155(erc1155Name, erc1155TokenId,
            test_utils.TEST_TOKENS_TRANSFER_VALUE, opts);
        await ima.mainnet.waitERC1155BalanceChange(erc1155Name, address, erc1155TokenId, balancesMainnet2[0]);

        const balancesMainnet3 = await test_utils.getERC1155Balances(ima.mainnet, erc1155Name, address, erc1155TokenId);
        const balancesSchain3 = await test_utils.getERC1155Balances(ima.schain, erc1155Name, address, erc1155TokenId);
        
        balancesMainnet3[0].should.be.equal(balancesMainnet1[0]);
        balancesSchain3[0].should.be.equal(balancesSchain1[0]);
    });

    it("Test ERC1155 batch deposit/withdraw", async () => {
        ima.addERC1155Token(erc1155Name, testTokens.mainnetERC1155, testTokens.schainERC1155);

        const balancesMainnet1 = await test_utils.getERC1155Balances(ima.mainnet, erc1155Name, address, erc1155TokenIds);
        const balancesSchain1 = await test_utils.getERC1155Balances(ima.schain, erc1155Name, address, erc1155TokenIds);

        await ima.depositERC1155(test_utils.CHAIN_NAME_SCHAIN, erc1155Name,
            erc1155TokenIds, erc1155Amounts, opts);
        await ima.schain.waitERC1155BalanceChange(erc1155Name, address, erc1155TokenIds[0], balancesSchain1[0]);

        let expectedMainnetBalances = test_utils.subArrays(test_utils.toNumbers(balancesMainnet1), test_utils.toNumbers(erc1155Amounts));
        let expectedSchainBalances = test_utils.addArrays(test_utils.toNumbers(balancesSchain1), test_utils.toNumbers(erc1155Amounts));

        const balancesMainnet2 = await test_utils.getERC1155Balances(ima.mainnet, erc1155Name, address, erc1155TokenIds);
        const balancesSchain2 = await test_utils.getERC1155Balances(ima.schain, erc1155Name, address, erc1155TokenIds);

        expect(balancesMainnet2).to.be.equalTo(test_utils.toStrings(expectedMainnetBalances));
        expect(balancesSchain2).to.be.equalTo(test_utils.toStrings(expectedSchainBalances));

        await ima.withdrawERC1155(erc1155Name, erc1155TokenIds, erc1155Amounts, opts);
        await ima.mainnet.waitERC1155BalanceChange(erc1155Name, address, erc1155TokenIds[0], balancesMainnet2[0]);

        const balancesMainnet3 = await test_utils.getERC1155Balances(ima.mainnet, erc1155Name, address, erc1155TokenIds);
        const balancesSchain3 = await test_utils.getERC1155Balances(ima.schain, erc1155Name, address, erc1155TokenIds);

        expect(balancesMainnet3).to.be.equalTo(balancesMainnet1);
        expect(balancesSchain3).to.be.equalTo(balancesSchain1);
    });

});
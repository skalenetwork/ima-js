import { Wallet } from "ethers";

import { Logger, ILogObj } from "tslog";

import chaiAsPromised from "chai-as-promised";
import * as chai from 'chai';
import * as dotenv from "dotenv";

import { IMA } from '../src/index';
import TxOpts from "../src/TxOpts";
import { ContractsStringMap } from '../src/BaseChain';

import * as helper from '../src/helper';
import * as constants from '../src/constants';
import * as _tu from './test_utils';
import { ZERO_ADDRESS } from "../src/constants";
import { exit } from "process";


dotenv.config();

chai.should();
chai.use(chaiAsPromised);

const assertArrays = require('chai-arrays');
chai.use(assertArrays);
let expect = require('chai').expect;

const log: Logger<ILogObj> = new Logger();


describe("ERC20/ERC721/ERC1155 tokens tests", () => {
    let opts: TxOpts;
    let testTokens: ContractsStringMap;

    let wallet: Wallet;

    let ima: IMA;
    let erc20Name: string;

    let erc721Name: string;
    let erc721TokenId: number;

    let erc1155Name: string;
    let erc1155TokenId: number;

    let erc1155TokenIds: Array<number>;
    let erc1155Amounts: Array<bigint>;

    before(async () => {
        ima = _tu.initTestIMA();
        wallet = new Wallet(_tu.MAINNET_PRIVATE_KEY);
        testTokens = _tu.initTestTokens(ima.mainnet.provider, ima.schain.provider);
        opts = {
            address: wallet.address,
            privateKey: _tu.SCHAIN_PRIVATE_KEY
        };

        erc20Name = 'testERC20';

        erc721Name = 'testERC721';
        erc721TokenId = 1;

        erc1155TokenId = 1;
        erc1155Name = 'testERC1155';
        erc1155TokenIds = [1, 2, 3];
        erc1155Amounts = [1000n, 2000n, 3000n];

        await _tu.grantPermissions(ima);
        if (!await ima.mainnet.messageProxy.isChainConnected(_tu.CHAIN_NAME_SCHAIN)) {
            await ima.connectSchain(_tu.CHAIN_NAME_SCHAIN, opts);
        }
        await ima.schain.communityLocker.setTimeLimitPerMessage(1, opts);
        await _tu.reimburseWallet(ima);
    });

    it("Test ERC20 approve/balance/deposit/withdraw", async () => {
        ima.addERC20Token(erc20Name, testTokens.mainnetERC20, testTokens.schainERC20);

        await ima.linkERC20Token(
            _tu.CHAIN_NAME_SCHAIN,
            _tu.MAINNET_CHAIN_NAME,
            await testTokens.mainnetERC20.getAddress(),
            await testTokens.schainERC20.getAddress(),
            opts
        )

        const balanceMainnet1 = await ima.mainnet.getERC20Balance(testTokens.mainnetERC20, wallet.address);
        const balanceSchain1 = await ima.schain.getERC20Balance(testTokens.schainERC20, wallet.address);

        await ima.mainnet.erc20.approve(erc20Name, constants.MAX_APPROVAL_AMOUNT, opts);
        await ima.depositERC20(_tu.CHAIN_NAME_SCHAIN, erc20Name,
            _tu.TEST_TOKENS_TRANSFER_VALUE, opts);

        await ima.schain.waitERC20BalanceChange(testTokens.schainERC20, wallet.address, balanceSchain1);

        const balanceMainnet2 = await ima.mainnet.getERC20Balance(testTokens.mainnetERC20, wallet.address);
        const balanceSchain2 = await ima.schain.getERC20Balance(testTokens.schainERC20, wallet.address);

        log.info('balanceMainnet1: ' + balanceMainnet1 + ', balanceSchain1: ' + balanceSchain1);
        log.info('balanceMainnet2: ' + balanceMainnet2 + ', balanceSchain2: ' + balanceSchain2);

        let expectedMainnetBalance = balanceMainnet1 - _tu.TEST_TOKENS_TRANSFER_VALUE;
        let expectedSchainBalance = balanceSchain1 + _tu.TEST_TOKENS_TRANSFER_VALUE;

        expect(balanceMainnet2).to.equal(expectedMainnetBalance);
        expect(balanceSchain2).to.equal(expectedSchainBalance);

        await ima.schain.erc20.approve(erc20Name, constants.MAX_APPROVAL_AMOUNT, ima.schain.erc20.address, opts);
        await ima.withdrawERC20(erc20Name, _tu.TEST_TOKENS_TRANSFER_VALUE, opts);

        await ima.mainnet.waitERC20BalanceChange(testTokens.mainnetERC20, wallet.address, balanceMainnet2);

        const balanceMainnet3 = await ima.mainnet.getERC20Balance(testTokens.mainnetERC20, wallet.address);
        const balanceSchain3 = await ima.schain.getERC20Balance(testTokens.schainERC20, wallet.address);

        expect(balanceMainnet3).to.equal(balanceMainnet1);
        expect(balanceSchain3).to.equal(balanceSchain1);
    });

    it("Test ERC20 tokens mapping", async () => {
        ima.addERC20Token(erc20Name, testTokens.mainnetERC20, testTokens.schainERC20);
        await ima.linkERC20Token(
            _tu.CHAIN_NAME_SCHAIN,
            _tu.MAINNET_CHAIN_NAME,
            await testTokens.mainnetERC20.getAddress(),
            await testTokens.schainERC20.getAddress(),
            opts
        );
        let erc20Len = await ima.mainnet.erc20.getTokenMappingsLength(_tu.CHAIN_NAME_SCHAIN);
        expect(erc20Len).to.equal(1);
        let erc20Tokens = await ima.mainnet.erc20.getTokenMappings(
            _tu.CHAIN_NAME_SCHAIN, 0, erc20Len);
        erc20Tokens[0].should.be.equal(testTokens.mainnetERC20.address);
    });

    it.skip("Test ERC20 S2S token mappings", async () => {
        // TODO: disabled due to the lack of S2S tests ATM
        const mappingsLengthERC20 = await ima.schain.erc20.getTokenMappingsLength(
            _tu.CHAIN_NAME_SCHAIN_2
        );
        console.log(mappingsLengthERC20);
        const mappingsERC20 = await ima.schain.erc20.getTokenMappings(
            _tu.CHAIN_NAME_SCHAIN_2,
            0,
            mappingsLengthERC20
        );
        console.log(mappingsERC20);

        const mappingsLengthERC721 = await ima.schain.erc721.getTokenMappingsLength(
            _tu.CHAIN_NAME_SCHAIN_2
        );
        console.log(mappingsLengthERC721);
        const mappingsERC721 = await ima.schain.erc721.getTokenMappings(
            _tu.CHAIN_NAME_SCHAIN_2,
            0,
            mappingsLengthERC721
        );
        console.log(mappingsERC721);
    });

    it("Test ERC721 tokens mapping", async () => {
        ima.addERC721Token(erc721Name, testTokens.mainnetERC721, testTokens.schainERC721);
        await ima.linkERC721Token(
            _tu.CHAIN_NAME_SCHAIN,
            _tu.MAINNET_CHAIN_NAME,
            await testTokens.mainnetERC721.getAddress(),
            await testTokens.schainERC721.getAddress(),
            opts
        );
        let erc721Len = await ima.mainnet.erc721.getTokenMappingsLength(
            _tu.CHAIN_NAME_SCHAIN);
        expect(erc721Len).to.equal(1);
        let erc721Tokens = await ima.mainnet.erc721.getTokenMappings(
            _tu.CHAIN_NAME_SCHAIN, 0, erc721Len);
        erc721Tokens[0].should.be.equal(testTokens.mainnetERC721.address);
    });

    it("Test ERC1155 tokens mapping", async () => {
        ima.addERC1155Token(erc1155Name, testTokens.mainnetERC1155, testTokens.schainERC1155);
        await ima.linkERC1155Token(
            _tu.CHAIN_NAME_SCHAIN,
            _tu.MAINNET_CHAIN_NAME,
            await testTokens.mainnetERC1155.getAddress(),
            await testTokens.schainERC1155.getAddress(),
            opts
        );
        let erc1155Len = await ima.mainnet.erc1155.getTokenMappingsLength(
            _tu.CHAIN_NAME_SCHAIN);
        expect(erc1155Len).to.equal(1);
        let erc1155Tokens = await ima.mainnet.erc1155.getTokenMappings(
            _tu.CHAIN_NAME_SCHAIN, 0, erc1155Len);
        erc1155Tokens[0].should.be.equal(testTokens.mainnetERC1155.address);
    });

    it("Test ERC721 approve/balance/deposit/withdraw", async () => {
        ima.addERC721Token(erc721Name, testTokens.mainnetERC721, testTokens.schainERC721);

        await ima.linkERC721Token(
            _tu.CHAIN_NAME_SCHAIN,
            _tu.MAINNET_CHAIN_NAME,
            await testTokens.mainnetERC721.getAddress(),
            await testTokens.schainERC721.getAddress(),
            opts
        );

        const erc721OwnerMainnet1 = await ima.mainnet.getERC721OwnerOf(testTokens.mainnetERC721, erc721TokenId);
        const erc721OwnerSchain1 = await ima.schain.getERC721OwnerOf(testTokens.schainERC721, erc721TokenId);
        const depositBoxAddress = ima.mainnet.erc721.address;

        if (erc721OwnerMainnet1 != depositBoxAddress) {
            await ima.mainnet.erc721.approve(erc721Name, erc721TokenId, opts);
        }
        await ima.depositERC721(_tu.CHAIN_NAME_SCHAIN, erc721Name,
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

        erc721OwnerMainnet3.should.be.equal(wallet.address);
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
            _tu.CHAIN_NAME_SCHAIN,
            _tu.MAINNET_CHAIN_NAME,
            await testTokens.mainnetERC721Meta.getAddress(),
            await testTokens.schainERC721Meta.getAddress(),
            opts
        );

        const erc721OwnerMainnet1 = await ima.mainnet.getERC721OwnerOf(testTokens.mainnetERC721Meta, erc721TokenId);
        const erc721OwnerSchain1 = await ima.schain.getERC721OwnerOf(testTokens.schainERC721Meta, erc721TokenId);
        const depositBoxAddress = ima.mainnet.erc721meta.address;

        if (erc721OwnerMainnet1 != depositBoxAddress) {
            await ima.mainnet.erc721meta.approve(erc721Name, erc721TokenId, opts);
        }
        await ima.depositERC721WithMetadata(_tu.CHAIN_NAME_SCHAIN, erc721Name,
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

        erc721OwnerMainnet3.should.be.equal(wallet.address);
        erc721OwnerSchain3.should.be.equal(ZERO_ADDRESS);
    });

    it("Test ERC1155 approve/balance/deposit/withdraw", async () => {
        ima.addERC1155Token(erc1155Name, testTokens.mainnetERC1155, testTokens.schainERC1155);

        await ima.linkERC1155Token(
            _tu.CHAIN_NAME_SCHAIN,
            _tu.MAINNET_CHAIN_NAME,
            await testTokens.mainnetERC1155.getAddress(),
            await testTokens.schainERC1155.getAddress(),
            opts
        );

        const balancesMainnet1 = await _tu.getERC1155Balances(ima.mainnet, testTokens.mainnetERC1155, wallet.address, erc1155TokenId);
        const balancesSchain1 = await _tu.getERC1155Balances(ima.schain, testTokens.schainERC1155, wallet.address, erc1155TokenId);

        await ima.mainnet.erc1155.approveAll(erc1155Name, opts);

        await ima.depositERC1155(_tu.CHAIN_NAME_SCHAIN, erc1155Name,
            erc1155TokenId, _tu.TEST_TOKENS_TRANSFER_VALUE, opts);
        await ima.schain.waitERC1155BalanceChange(testTokens.schainERC1155, wallet.address, erc1155TokenId, balancesSchain1[0]);

        const balancesMainnet2 = await _tu.getERC1155Balances(ima.mainnet, testTokens.mainnetERC1155, wallet.address, erc1155TokenId);
        const balancesSchain2 = await _tu.getERC1155Balances(ima.schain, testTokens.schainERC1155, wallet.address, erc1155TokenId);

        let expectedMainnetBalance = balancesMainnet1[0] - _tu.TEST_TOKENS_TRANSFER_VALUE;
        let expectedSchainBalance = balancesSchain1[0] + _tu.TEST_TOKENS_TRANSFER_VALUE;


        balancesMainnet2[0].should.be.equal(expectedMainnetBalance);
        balancesSchain2[0].should.be.equal(expectedSchainBalance);


        await ima.schain.erc1155.approveAll(erc1155Name, erc1155TokenId, opts);
        await ima.withdrawERC1155(erc1155Name, erc1155TokenId,
            _tu.TEST_TOKENS_TRANSFER_VALUE, opts);
        await ima.mainnet.waitERC1155BalanceChange(testTokens.mainnetERC1155, wallet.address, erc1155TokenId, balancesMainnet2[0]);

        const balancesMainnet3 = await _tu.getERC1155Balances(ima.mainnet, testTokens.mainnetERC1155, wallet.address, erc1155TokenId);
        const balancesSchain3 = await _tu.getERC1155Balances(ima.schain, testTokens.schainERC1155, wallet.address, erc1155TokenId);

        balancesMainnet3[0].should.be.equal(balancesMainnet1[0]);
        balancesSchain3[0].should.be.equal(balancesSchain1[0]);
    });

    it("Test ERC1155 batch deposit/withdraw", async () => {
        ima.addERC1155Token(erc1155Name, testTokens.mainnetERC1155, testTokens.schainERC1155);

        const balancesMainnet1 = await _tu.getERC1155Balances(ima.mainnet, testTokens.mainnetERC1155, wallet.address, erc1155TokenIds);
        const balancesSchain1 = await _tu.getERC1155Balances(ima.schain, testTokens.schainERC1155, wallet.address, erc1155TokenIds);

        await ima.depositERC1155(_tu.CHAIN_NAME_SCHAIN, erc1155Name,
            erc1155TokenIds, erc1155Amounts, opts);
        await ima.schain.waitERC1155BalanceChange(testTokens.schainERC1155, wallet.address, erc1155TokenIds[0], balancesSchain1[0]);

        let expectedMainnetBalances = _tu.subArrays(balancesMainnet1, erc1155Amounts);
        let expectedSchainBalances = _tu.addArrays(balancesSchain1, erc1155Amounts);

        const balancesMainnet2 = await _tu.getERC1155Balances(ima.mainnet, testTokens.mainnetERC1155, wallet.address, erc1155TokenIds);
        const balancesSchain2 = await _tu.getERC1155Balances(ima.schain, testTokens.schainERC1155, wallet.address, erc1155TokenIds);

        balancesMainnet2[0].should.be.equal(expectedMainnetBalances[0]);
        balancesSchain2[0].should.be.equal(expectedSchainBalances[0]);
        balancesMainnet2[1].should.be.equal(expectedMainnetBalances[1]);
        balancesSchain2[1].should.be.equal(expectedSchainBalances[1]);
        balancesMainnet2[2].should.be.equal(expectedMainnetBalances[2]);
        balancesSchain2[2].should.be.equal(expectedSchainBalances[2]);

        await ima.withdrawERC1155(erc1155Name, erc1155TokenIds, erc1155Amounts, opts);
        await ima.mainnet.waitERC1155BalanceChange(testTokens.mainnetERC1155, wallet.address, erc1155TokenIds[0], balancesMainnet2[0]);

        const balancesMainnet3 = await _tu.getERC1155Balances(ima.mainnet, testTokens.mainnetERC1155, wallet.address, erc1155TokenIds);
        const balancesSchain3 = await _tu.getERC1155Balances(ima.schain, testTokens.schainERC1155, wallet.address, erc1155TokenIds);

        balancesMainnet3[0].should.be.equal(expectedMainnetBalances[0]);
        balancesSchain3[0].should.be.equal(expectedSchainBalances[0]);
        balancesMainnet3[1].should.be.equal(expectedMainnetBalances[1]);
        balancesSchain3[1].should.be.equal(expectedSchainBalances[1]);
        balancesMainnet3[2].should.be.equal(expectedMainnetBalances[2]);
        balancesSchain3[2].should.be.equal(expectedSchainBalances[2]);
    });

});
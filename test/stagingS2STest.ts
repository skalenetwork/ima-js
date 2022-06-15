import chaiAsPromised from "chai-as-promised";
import chai = require("chai");
import * as dotenv from "dotenv";

import SChain from '../src/SChain';

import TxOpts from "../src/TxOpts";
import { ContractsStringMap } from '../src/BaseChain';
import { Contract } from 'web3-eth-contract';

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
    let opts2: TxOpts;
    let sChain1Contract: Contract;

    let address: string;
    let address2: string;

    let sChain1: SChain;
    let sChain2: SChain;

    let erc721Name: string;
    let erc721TokenId: number;

    before(async () => {
        sChain1 = test_utils.initSChain1();
        sChain2 = test_utils.initSChain2();

        address = helper.privateKeyToAddress(sChain1.web3, test_utils.SCHAIN_PRIVATE_KEY);
        address2 = helper.privateKeyToAddress(sChain2.web3, test_utils.SCHAIN_PRIVATE_KEY_2);

        sChain1Contract = test_utils.s2sToken(sChain1.web3);

        opts = {
            address: address,
            privateKey: test_utils.SCHAIN_PRIVATE_KEY
        };

        opts2 = {
            address: address2,
            privateKey: test_utils.SCHAIN_PRIVATE_KEY_2
        };

        erc721Name = 'testERC721';
        erc721TokenId = 1;

        // await test_utils.grantPermissions(sChain1, opts, address);
        // await test_utils.grantPermissions(sChain2, opts2, address2);

        // await test_utils.reimburseWallet(ima);
    });

    it.only("Test ERC721 approve/balance/deposit/withdraw between chains", async () => {
        sChain1.erc721.addToken(erc721Name, sChain1Contract);

        let chain1Connected = await sChain1.tokenManagerLinker.hasSchain(test_utils.CHAIN_NAME_SCHAIN_2);
        if (!chain1Connected) {
            console.log('Connecting chain ' + test_utils.CHAIN_NAME_SCHAIN + 'to ' + test_utils.CHAIN_NAME_SCHAIN_2);
            await sChain1.tokenManagerLinker.connectSchain(test_utils.CHAIN_NAME_SCHAIN_2, opts);
        }

        let chain2Connected = await sChain2.tokenManagerLinker.hasSchain(test_utils.CHAIN_NAME_SCHAIN);
        if (!chain2Connected) {
            console.log('Connecting chain ' + test_utils.CHAIN_NAME_SCHAIN_2 + 'to ' + test_utils.CHAIN_NAME_SCHAIN);
            await sChain2.tokenManagerLinker.connectSchain(test_utils.CHAIN_NAME_SCHAIN, opts2);
        }

        let isAutomaticDeployEnabled1 = await sChain1.erc721.automaticDeploy();
        if (!isAutomaticDeployEnabled1) {
            await sChain1.erc721.enableAutomaticDeploy(opts)
        }

        let isAutomaticDeployEnabled2 = await sChain2.erc721.automaticDeploy();
        if (!isAutomaticDeployEnabled2) {
            await sChain2.erc721.enableAutomaticDeploy(opts2)
        }

        // const ownerOnSchain1_1 = await sChain1.getERC721OwnerOf(sChain1Contract, erc721TokenId);
        // const ownerOnSchain2_1 = await sChain2.getERC721OwnerOf(sChain2Contact, erc721TokenId);
        // console.log('ownerOnSchain1 before transfer: ' + ownerOnSchain1_1);
        // console.log('ownerOnSchain2 before transfer: ' + ownerOnSchain2_1);
    
        await sChain1.erc721.approve(erc721Name, erc721TokenId, opts);

        await sChain1.erc721.transferToSchain(
            test_utils.CHAIN_NAME_SCHAIN_2,
            sChain1Contract.options.address,
            erc721TokenId,
            opts
        );

        // todo: await for s2s transfer fuction!

        console.log('Waiting for s2s transfer...');
        await helper.sleep(15000);

        // console.log(sChain1Contract.options.address);

        let tokenCloneAddress = await sChain2.erc721.getTokenCloneAddress(
            sChain1Contract.options.address,
            test_utils.CHAIN_NAME_SCHAIN
        );

        let sChain2Contract = new sChain2.web3.eth.Contract(
            sChain1Contract.options.jsonInterface,
            tokenCloneAddress
        );

        sChain2.erc721.addToken(erc721Name, sChain2Contract);

        console.log('tokenCloneAddress tokenCloneAddress');
        console.log(tokenCloneAddress);

        const ownerOnSchain1_2 = await sChain1.getERC721OwnerOf(sChain1Contract, erc721TokenId);
        const ownerOnSchain2_2 = await sChain2.getERC721OwnerOf(sChain2Contract, erc721TokenId);
        console.log('ownerOnSchain1 after transfer: ' + ownerOnSchain1_2);
        console.log('ownerOnSchain2 after transfer: ' + ownerOnSchain2_2);

        // await sChain2.erc721.approve(erc721Name, erc721TokenId, opts2);

        // await sChain2.erc721.transferToSchain(
        //     test_utils.CHAIN_NAME_SCHAIN,
        //     sChain1Contract.options.address,
        //     erc721TokenId,
        //     opts2
        // );

        // await sChain2.waitERC721OwnerChange(testTokens.schainERC721, erc721TokenId, erc721OwnerSchain1);

        // const erc721OwnerMainnet2 = await ima.mainnet.getERC721OwnerOf(testTokens.mainnetERC721, erc721TokenId);
        // const erc721OwnerSchain2 = await ima.schain.getERC721OwnerOf(testTokens.schainERC721, erc721TokenId);

        // erc721OwnerMainnet2.should.be.equal(ima.mainnet.erc721.address);
        // erc721OwnerSchain2.should.be.equal(erc721OwnerMainnet1);

        // await ima.schain.erc721.approve(erc721Name, erc721TokenId, opts);
        // await ima.withdrawERC721(erc721Name, erc721TokenId, opts);
        // await ima.mainnet.waitERC721OwnerChange(testTokens.mainnetERC721, erc721TokenId, erc721OwnerMainnet2);

        // const erc721OwnerMainnet3 = await ima.mainnet.getERC721OwnerOf(testTokens.mainnetERC721, erc721TokenId);
        // const erc721OwnerSchain3 = await ima.schain.getERC721OwnerOf(testTokens.schainERC721, erc721TokenId);

        // erc721OwnerMainnet3.should.be.equal(address);
        // erc721OwnerSchain3.should.be.equal(ZERO_ADDRESS);
    });
});
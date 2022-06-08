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
    let sChain1Contact: Contract;

    let address: string;

    let sChain1: SChain;
    let sChain2: SChain;

    let erc721Name: string;
    let erc721TokenId: number;

    before(async () => {
        sChain1 = test_utils.initSChain1();
        sChain2 = test_utils.initSChain2();

        address = helper.privateKeyToAddress(sChain1.web3, test_utils.SCHAIN_PRIVATE_KEY);

        sChain1Contact = test_utils.s2sToken(sChain1.web3);

        opts = {
            address: address,
            privateKey: test_utils.SCHAIN_PRIVATE_KEY
        };

        erc721Name = 'testERC721';
        erc721TokenId = 1;

        // await test_utils.reimburseWallet(ima);
    });

    it.only("Test ERC721 approve/balance/deposit/withdraw between chains", async () => {
        sChain1.erc721.addToken(erc721Name, sChain1Contact);

        const ownerSchain1 = await sChain1.getERC721OwnerOf(sChain1Contact, erc721TokenId);

        console.log('ownerSchain1 ownerSchain1 ownerSchain1');
        console.log(ownerSchain1);

        let res = await sChain1.tokenManagerLinker.hasSchain(test_utils.CHAIN_NAME_SCHAIN_2);
        console.log(test_utils.CHAIN_NAME_SCHAIN_2);
        console.log(res);

        // await sChain1.erc721.approve(erc721Name, erc721TokenId, opts);

        // await sChain1.erc721.transferToSchain(
        //     test_utils.CHAIN_NAME_SCHAIN_2,
        //     sChain1Contact.options.address,
        //     erc721TokenId,
        //     opts
        // )

        

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
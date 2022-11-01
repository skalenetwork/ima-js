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


describe("ERC1155 S2S transfer flow", () => {
    let opts: TxOpts;
    let opts2: TxOpts;
    let sChain1Contract: Contract;

    let address: string;
    let address2: string;

    let sChain1: SChain;
    let sChain2: SChain;

    let erc1155Name: string;
    let erc1155TokenId: number;
    let erc1155Amount: string;

    before(async () => {
        sChain1 = test_utils.initSChain1();
        sChain2 = test_utils.initSChain2();

        address = helper.privateKeyToAddress(sChain1.web3, test_utils.SCHAIN_PRIVATE_KEY);
        address2 = helper.privateKeyToAddress(sChain2.web3, test_utils.SCHAIN_PRIVATE_KEY_2);

        sChain1Contract = test_utils.s2sTokenERC1155(sChain1.web3);

        opts = {
            address: address,
            privateKey: test_utils.SCHAIN_PRIVATE_KEY
        };

        opts2 = {
            address: address2,
            privateKey: test_utils.SCHAIN_PRIVATE_KEY_2
        };

        erc1155Name = 'testERC1155';
        erc1155TokenId = 3;
        erc1155Amount = '1000';

        await sChain2.sendSFuel(address, '0.5', opts2);
    });

    it("Test ERC1155 approve/balance/deposit/withdraw between chains", async () => {
        sChain1.erc1155.addToken(erc1155Name, sChain1Contract);

        // one-time admin setup

        // let chain1Connected = await sChain1.tokenManagerLinker.hasSchain(test_utils.CHAIN_NAME_SCHAIN_2);
        // if (!chain1Connected) {
        //     console.log('Connecting chain ' + test_utils.CHAIN_NAME_SCHAIN + 'to ' + test_utils.CHAIN_NAME_SCHAIN_2);
        //     await sChain1.tokenManagerLinker.connectSchain(test_utils.CHAIN_NAME_SCHAIN_2, opts);
        // }

        // let chain2Connected = await sChain2.tokenManagerLinker.hasSchain(test_utils.CHAIN_NAME_SCHAIN);
        // if (!chain2Connected) {
        //     console.log('Connecting chain ' + test_utils.CHAIN_NAME_SCHAIN_2 + 'to ' + test_utils.CHAIN_NAME_SCHAIN);
        //     await sChain2.tokenManagerLinker.connectSchain(test_utils.CHAIN_NAME_SCHAIN, opts2);
        // }

        // let isAutomaticDeployEnabled1 = await sChain1.erc1155.automaticDeploy();
        // if (!isAutomaticDeployEnabled1) {
        //     await sChain1.erc1155.enableAutomaticDeploy(opts)
        // }

        // let isAutomaticDeployEnabled2 = await sChain2.erc1155.automaticDeploy();
        // if (!isAutomaticDeployEnabled2) {
        //     await sChain2.erc1155.enableAutomaticDeploy(opts2)
        // }

        const aaddr = '0x991F32D3B6609cA67Fb94AC4Fe21FE4FEeEeF6f7';
        await sChain1.sendSFuel(aaddr, '15.5', opts);
        await sChain2.sendSFuel(aaddr, '15.5', opts2);


        await sChain1.erc1155.sendTokens(
            erc1155Name,
            aaddr,
            1,
            '10',
            opts
        );
        await sChain1.erc1155.sendTokens(
            erc1155Name,
            aaddr,
            2,
            '100',
            opts
        );
        await sChain1.erc1155.sendTokens(
            erc1155Name,
            aaddr,
            3,
            '1000',
            opts
        );


        // await sChain1.erc1155.approveAll(erc1155Name, erc1155TokenId, opts);
        // await sChain1.erc1155.transferToSchain(
        //     test_utils.CHAIN_NAME_SCHAIN_2,
        //     sChain1Contract.options.address,
        //     erc1155TokenId,
        //     erc1155Amount,
        //     opts
        // );
    });
});
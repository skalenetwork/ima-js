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


describe("ERC20 S2S transfer flow", () => {
    let opts: TxOpts;
    let opts2: TxOpts;
    let sChain1Contract: Contract;

    let address: string;
    let address2: string;

    let sChain1: SChain;
    let sChain2: SChain;

    let erc20Name: string;

    before(async () => {
        sChain1 = test_utils.initSChain1();
        sChain2 = test_utils.initSChain2();

        address = helper.privateKeyToAddress(sChain1.web3, test_utils.SCHAIN_PRIVATE_KEY);
        address2 = helper.privateKeyToAddress(sChain2.web3, test_utils.SCHAIN_PRIVATE_KEY_2);

        sChain1Contract = test_utils.s2sTokenERC20(sChain1.web3);

        opts = {
            address: address,
            privateKey: test_utils.SCHAIN_PRIVATE_KEY
        };

        opts2 = {
            address: address2,
            privateKey: test_utils.SCHAIN_PRIVATE_KEY_2
        };

        erc20Name = 'testERC20';

        await sChain2.sendSFuel(address, '0.5', opts2);

        // await test_utils.grantPermissions(sChain1, opts, address);
        // await test_utils.grantPermissions(sChain2, opts2, address2);

        // await test_utils.reimburseWallet(ima);
    });

    it("Test ERC20 approve/balance/deposit/withdraw between chains", async () => {
        sChain1.erc20.addToken(erc20Name, sChain1Contract);

        // one-time admin setup

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

        let isAutomaticDeployEnabled1 = await sChain1.erc20.automaticDeploy();
        if (!isAutomaticDeployEnabled1) {
            await sChain1.erc20.enableAutomaticDeploy(opts)
        }

        let isAutomaticDeployEnabled2 = await sChain2.erc20.automaticDeploy();
        if (!isAutomaticDeployEnabled2) {
            await sChain2.erc20.enableAutomaticDeploy(opts2)
        }

        const balance1_1 = await sChain1.getERC20Balance(sChain1Contract, address);
        console.log('balance on chain 1 before transfer: ' + balance1_1);
    
        let sChain2Contract: Contract;
        let balance2_1: string = '';
        let tokenCloneAddress = await sChain2.erc20.getTokenCloneAddress(
            sChain1Contract.options.address,
            test_utils.CHAIN_NAME_SCHAIN
        );
        if (tokenCloneAddress !== constants.ZERO_ADDRESS) {
            sChain2Contract = new sChain2.web3.eth.Contract(
                sChain1Contract.options.jsonInterface,
                tokenCloneAddress
            );
            balance2_1 = await sChain2.getERC20Balance(sChain2Contract, address);
        }
        console.log('balance on chain 2 before transfer: ' + balance2_1);

        // transfer 1 -> 2

        await sChain1.erc20.approve(erc20Name, test_utils.TEST_TOKENS_TRANSFER_VALUE, opts);
        await sChain1.erc20.transferToSchain(
            test_utils.CHAIN_NAME_SCHAIN_2,
            sChain1Contract.options.address,
            test_utils.TEST_TOKENS_TRANSFER_VALUE,
            opts
        );

        tokenCloneAddress = await sChain2.erc20.waitForTokenClone(
            sChain1Contract.options.address,
            test_utils.CHAIN_NAME_SCHAIN
        );

        sChain2Contract = new sChain2.web3.eth.Contract(
            sChain1Contract.options.jsonInterface,
            tokenCloneAddress
        );

        sChain2.erc20.addToken(erc20Name, sChain2Contract);

        if (balance2_1 !== '') {
            await sChain2.waitERC20BalanceChange(sChain2Contract, address, balance2_1);
        }

        const balance1_2 = await sChain1.getERC20Balance(sChain1Contract, address);
        const balance2_2 = await sChain2.getERC20Balance(sChain2Contract, address);
        console.log('balance on chain 1 after transfer: ' + balance1_2);
        console.log('balance on chain 2 after transfer: ' + balance2_2);

        // transfer 2 -> 1

        await sChain2.erc20.approve(erc20Name, test_utils.TEST_TOKENS_TRANSFER_VALUE, opts);
        await sChain2.erc20.transferToSchain(
            test_utils.CHAIN_NAME_SCHAIN,
            sChain1Contract.options.address,
            test_utils.TEST_TOKENS_TRANSFER_VALUE,
            opts
        );
        await sChain1.waitERC20BalanceChange(sChain1Contract, address, balance1_2);

        const balance1_3 = await sChain1.getERC20Balance(sChain1Contract, address);
        const balance2_3 = await sChain2.getERC20Balance(sChain2Contract, address);
        console.log('balance on chain 1 after transfering back: ' + balance1_3);
        console.log('balance on chain 2 after transfering back: ' + balance2_3);
    });
});
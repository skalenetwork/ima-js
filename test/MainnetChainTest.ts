import chaiAsPromised from "chai-as-promised";
import chai = require("chai");
let Web3 = require('web3');

import MainnetChain from '../src/MainnetChain';
import { helper } from '../src/helper';

import * as dotenv from "dotenv";

dotenv.config();

chai.should();
chai.use(chaiAsPromised);

const MAINNET_ENDPOINT = process.env["MAINNET_ENDPOINT"];
const MAINNET_PRIVATE_KEY = helper.add0x(process.env.MAINNET_PRIVATE_KEY);
const MAINNET_ABI_FILEPATH = process.env["MAINNET_ABI_FILEPATH"] || __dirname + '/../abis/proxyMainnet.json';

const CHAIN_NAME_SCHAIN = (process.env["CHAIN_NAME_SCHAIN"] as string);

const TEST_WEI_TRANSFER_VALUE = '10000000000000000';


describe("Mainnet chain test", () => {
  let web3: typeof Web3;
  let address: string;
  let mainnetChain: MainnetChain;

  before(async () => {
    let provider = new Web3.providers.HttpProvider(MAINNET_ENDPOINT);
    web3 = new Web3(provider);
    address = helper.privateKeyToAddress(web3, MAINNET_PRIVATE_KEY);
    let abi = helper.jsonFileLoad(MAINNET_ABI_FILEPATH);
    mainnetChain = new MainnetChain(web3, abi);
  });

  it("Requests ETH balance for Mainnet chain", async () => {
    let balance = await mainnetChain.ethBalance(address);
    balance.should.be.a('string');
  });

  it("Deposits ETH from Mainnet to sChain", async () => {
    let mainnetBalanceBefore = await mainnetChain.ethBalance(address);
    let res = await mainnetChain.depositETHtoSChain(CHAIN_NAME_SCHAIN, address, TEST_WEI_TRANSFER_VALUE);
  });
});
import chaiAsPromised from "chai-as-promised";
import chai = require("chai");
let Web3 = require('web3');

import SChain from '../src/SChain';
import * as helper from '../src/helper';

import * as dotenv from "dotenv";
dotenv.config();

const SCHAIN_ENDPOINT = process.env["SCHAIN_ENDPOINT"];
const SCHAIN_PRIVATE_KEY = helper.add0x(process.env.SCHAIN_PRIVATE_KEY);

const SCHAIN_ABI_FILEPATH = process.env["SCHAIN_ABI_FILEPATH"] || __dirname + '/../abis/proxySchain.json';

chai.should();
chai.use(chaiAsPromised);

describe("sChain test", () => {
  let web3: typeof Web3;
  let address: string;
  let sChain: SChain;

  before(async () => {
    let provider = new Web3.providers.HttpProvider(SCHAIN_ENDPOINT);
    web3 = new Web3(provider);
    address = helper.privateKeyToAddress(web3, SCHAIN_PRIVATE_KEY);
    let abi = helper.jsonFileLoad(SCHAIN_ABI_FILEPATH);
    sChain = new SChain(web3, abi);
  });

  it("Requests ERC20 ETH balance for sChain", async () => {
    let balance = await sChain.ethBalance(address);
    balance.should.be.a('string');
  });
});
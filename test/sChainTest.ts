import chaiAsPromised from "chai-as-promised";
import chai = require("chai");
import * as dotenv from "dotenv";

let Web3 = require('web3');

import SChain from '../src/SChain';
import * as helper from '../src/helper';

import * as test_utils from './test_utils';


dotenv.config();

const SCHAIN_PRIVATE_KEY = helper.add0x(process.env.SCHAIN_PRIVATE_KEY);

chai.should();
chai.use(chaiAsPromised);

describe("sChain test", () => {
  let web3: typeof Web3;
  let address: string;
  let sChain: SChain;

  before(async () => {
    sChain = test_utils.initTestSChain();
    address = helper.privateKeyToAddress(sChain.web3, SCHAIN_PRIVATE_KEY);
  });

  it("Requests ERC20 ETH balance for sChain", async () => {
    let balance = await sChain.ethBalance(address);
    balance.should.be.a('string');
  });
});
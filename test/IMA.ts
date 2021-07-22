import chaiAsPromised from "chai-as-promised";
import chai = require("chai");
let Web3 = require('web3');

import IMA from '../src/index';

// let abis = require("../src/abis/manager.json");

const ENDPOINT = process.env["ENDPOINT"];

chai.should();
chai.use(chaiAsPromised);

describe("IMA base test", () => {
  before(async () => {

  });

  it("Gets current block", async () => {
    const provider = new Web3.providers.HttpProvider(ENDPOINT);
    let web3 = new Web3(provider);
    let ima = new IMA(web3);
    const block = await ima.getBlock();
    block.should.be.equal(await web3.eth.getBlockNumber());
  });

});
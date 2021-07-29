import chaiAsPromised from "chai-as-promised";
import chai = require("chai");
let Web3 = require('web3');

import * as helper from '../src/helper';

import * as dotenv from "dotenv";
dotenv.config();


const MAINNET_ENDPOINT = process.env["MAINNET_ENDPOINT"];
const SCHAIN_ENDPOINT = process.env["SCHAIN_ENDPOINT"];

const MAINNET_PRIVATE_KEY = helper.add0x(process.env.MAINNET_PRIVATE_KEY);
const MAINNET_ADDRESS = helper.add0x(process.env.MAINNET_ADDRESS);

chai.should();
chai.use(chaiAsPromised);

describe("Helper test", () => {
  let web3: typeof Web3;

  before(async () => {
    const provider = new Web3.providers.HttpProvider(MAINNET_ENDPOINT);
    web3 = new Web3(provider);
  });

  it("Creates an account object from private key", async () => {
    let account = helper.privateKeyToAccount(web3, MAINNET_PRIVATE_KEY);
    account.privateKey.should.be.equal(MAINNET_PRIVATE_KEY);
  });

  it("Coverts private key to address", async () => {
    let address = helper.privateKeyToAddress(web3, MAINNET_PRIVATE_KEY);
    address.should.be.equal(MAINNET_ADDRESS);
  });

});
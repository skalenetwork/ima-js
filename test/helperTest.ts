import chaiAsPromised from "chai-as-promised";
import { ethers, providers, Contract, getDefaultProvider, Wallet } from "ethers";

import chai from 'chai';

import * as helper from '../src/helper';

import * as dotenv from "dotenv";
dotenv.config();

const MAINNET_ENDPOINT = process.env["MAINNET_ENDPOINT"];
const MAINNET_PRIVATE_KEY = helper.add0x(process.env.TEST_PRIVATE_KEY);

chai.should();
chai.use(chaiAsPromised);

describe("Helper test", () => {
  let provider: providers.BaseProvider;

  before(async () => {
    provider = new providers.JsonRpcProvider(MAINNET_ENDPOINT);
  });

  it("Gets account balance", async () => {
    const wallet = new Wallet (MAINNET_PRIVATE_KEY, provider);
    let balance = await provider.getBalance(wallet.address);
    console.log('balance: ' + balance);
  });

});
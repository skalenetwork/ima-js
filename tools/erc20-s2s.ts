
import { Wallet, Contract } from "ethers";
import { Logger, ILogObj } from "tslog";

import * as utils from '../test/test_utils';
import { MainnetChain, SChain } from "../src";
import TxOpts from '../src/TxOpts';
import { initToken } from '../src/contracts/tokens';

const log: Logger<ILogObj> = new Logger();


async function erc20S2S(
    sChain1: SChain,
    sChain2: SChain,
    wallet: Wallet,
    tokenSource: Contract,
    tokenDest: Contract,
    destChainName: string,
    value: bigint = utils.TEST_WEI_TRANSFER_VALUE
) {
    const symbol = await tokenSource.symbol()
    if (!sChain1.erc20.tokens[symbol]) {
        sChain1.erc20.addToken(symbol, tokenSource)
    }
    if (!sChain2.erc20.tokens[symbol]) {
        sChain2.erc20.addToken(symbol, tokenDest)
    }

    let balanceBefore: bigint = await sChain2.getERC20Balance(tokenDest, wallet.address)
    let txOpts: TxOpts = { value, address: wallet.address, privateKey: wallet.privateKey }
    const tx = await sChain1.erc20.transferToSchain(destChainName, symbol, value, txOpts)
    await sChain2.waitERC20BalanceChange(tokenDest, wallet.address, balanceBefore)
    let balanceAfter: bigint = await sChain2.getERC20Balance(tokenDest, wallet.address)
    return { tx, balanceBefore, balanceAfter }
}


async function test() {
    const sChain1 = utils.initTestSChain(utils.SCHAIN_ENDPOINT)
    const sChain2 = utils.initTestSChain(utils.SCHAIN_2_ENDPOINT)
}


export const TOKEN_ADDRESS_SOURCE = (process.env["TOKEN_ADDRESS_SOURCE"] as string);
export const TOKEN_ADDRESS_DEST = (process.env["TOKEN_ADDRESS_SOURCE"] as string);


await test()
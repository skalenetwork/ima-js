
import { Wallet, Contract } from "ethers";
import { Logger, ILogObj } from "tslog";

import * as utils from '../test/test_utils';
import { MainnetChain, SChain } from "../src";
import TxOpts from '../src/TxOpts';

const log: Logger<ILogObj> = new Logger();


async function ethM2S(
    mainnet: MainnetChain,
    sChain: SChain,
    wallet: Wallet,
    destChainName: string,
    value: bigint = utils.TEST_WEI_TRANSFER_VALUE
) {
    const balanceBefore: bigint = await sChain.ethBalance(wallet.address)
    const txOpts: TxOpts = { value, address: wallet.address, privateKey: wallet.privateKey }
    const tx = await mainnet.eth.deposit(destChainName, txOpts)
    await sChain.waitETHBalanceChange(wallet.address, balanceBefore)
    let balanceAfter: bigint = await sChain.ethBalance(wallet.address)
    return { tx, balanceBefore, balanceAfter }
}


async function ethS2M(
    mainnet: MainnetChain,
    sChain: SChain,
    wallet: Wallet,
    value: bigint = utils.TEST_WEI_TRANSFER_VALUE
) {
    const balanceBefore: bigint = await mainnet.ethBalance(wallet.address)
    const txOpts: TxOpts = { value, address: wallet.address, privateKey: wallet.privateKey }
    const tx = await sChain.eth.withdraw(value, txOpts)
    await mainnet.waitETHBalanceChange(wallet.address, balanceBefore)
    const balanceAfter: bigint = await mainnet.ethBalance(wallet.address)
    return { tx, balanceBefore, balanceAfter }
}


async function erc20M2S(
    mainnet: MainnetChain,
    sChain: SChain,
    wallet: Wallet,
    tokenSource: Contract,
    tokenDest: Contract,
    destChainName: string,
    value: bigint = utils.TEST_WEI_TRANSFER_VALUE
) {
    const symbol = await tokenSource.symbol()
    if (!mainnet.erc20.tokens[symbol]) {
        mainnet.erc20.addToken(symbol, tokenSource)
    }
    if (!sChain.erc20.tokens[symbol]) {
        sChain.erc20.addToken(symbol, tokenDest)
    }

    let balanceBefore: bigint = await sChain.getERC20Balance(tokenDest, wallet.address)
    let txOpts: TxOpts = { value, address: wallet.address, privateKey: wallet.privateKey }
    const tx = await mainnet.erc20.deposit(destChainName, symbol, value, txOpts)
    await sChain.waitERC20BalanceChange(tokenDest, wallet.address, balanceBefore)
    let balanceAfter: bigint = await sChain.getERC20Balance(tokenDest, wallet.address)
    return { tx, balanceBefore, balanceAfter }
}


async function transferETH() {
    const wallet = new Wallet(utils.SCHAIN_PRIVATE_KEY);
    const mainnet = utils.initTestMainnet();
    const sChain1 = utils.initTestSChain(utils.SCHAIN_ENDPOINT);

    log.info(await mainnet.ethBalance(wallet.address))
    log.info(await sChain1.ethBalance(wallet.address))

    await ethM2S(mainnet, sChain1, wallet, utils.CHAIN_NAME_SCHAIN)

    log.info(await mainnet.ethBalance(wallet.address))
    log.info(await sChain1.ethBalance(wallet.address))

    await ethS2M(mainnet, sChain1, wallet)

    log.info(await mainnet.ethBalance(wallet.address))
    log.info(await sChain1.ethBalance(wallet.address))
}


async function test() {
    const sChain1 = utils.initTestSChain(utils.SCHAIN_ENDPOINT);
    const mainnetHash = await sChain1.communityLocker.contract.MAINNET_HASH()
    const limit = await sChain1.communityLocker.contract.timeLimitPerMessage(mainnetHash)
    console.log(limit)
}

// await transferETH()

await test()
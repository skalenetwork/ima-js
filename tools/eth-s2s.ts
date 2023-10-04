
import { Wallet } from "ethers";
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
    let balanceBefore: bigint = await sChain.ethBalance(wallet.address)
    let txOpts: TxOpts = { value, address: wallet.address, privateKey: wallet.privateKey }
    await mainnet.eth.deposit(destChainName, txOpts)
    await sChain.waitETHBalanceChange(wallet.address, balanceBefore)
}


async function ethS2M(
    mainnet: MainnetChain,
    sChain: SChain,
    wallet: Wallet,
    value: bigint = utils.TEST_WEI_TRANSFER_VALUE
) {
    let balanceBefore: bigint = await mainnet.ethBalance(wallet.address)
    let txOpts: TxOpts = { value, address: wallet.address, privateKey: wallet.privateKey }
    await sChain.eth.withdraw(value, txOpts)
    await mainnet.waitETHBalanceChange(wallet.address, balanceBefore)
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

await transferETH()
import Web3 from 'web3';
import { IMA, helper } from '@skalenetwork/ima-js';

import proxyMainnet from './proxyMainnet.json';
import proxySchain from './proxySchain.json';

const MAINNET_ENDPOINT = 'http://localhost:1545';
const SCHAIN_ENDPOINT = 'http://localhost:15000';

const TEST_WEI_TRANSFER_VALUE = '20000000000000000';
const TEST_WEI_REIMBURSEMENT_VALUE = '500000000000000000';

const SCHAIN_NAME = 'Bob';

const SDK_PRIVATE_KEY = helper.add0x(process.env.SDK_PRIVATE_KEY);
const TEST_PRIVATE_KEY = helper.add0x(process.env.TEST_PRIVATE_KEY);

function initIMA() {
    const mainnetWeb3 = new Web3(MAINNET_ENDPOINT);
    const sChainWeb3 = new Web3(SCHAIN_ENDPOINT);
    return new IMA(mainnetWeb3, sChainWeb3, proxyMainnet, proxySchain);
}

async function reimburseWallet(ima) {
    let testAddress = helper.privateKeyToAddress(ima.schain.web3, TEST_PRIVATE_KEY);
    let txOpts = {
        value: TEST_WEI_REIMBURSEMENT_VALUE,
        address: testAddress,
        privateKey: TEST_PRIVATE_KEY
    };
    await ima.mainnet.reimbursementWalletRecharge(
        SCHAIN_NAME,
        testAddress,
        txOpts
    );
}

async function chainSetup(ima) {
    const sdkAddress = helper.privateKeyToAddress(ima.mainnet.web3, SDK_PRIVATE_KEY);
    const opts = {
        address: sdkAddress,
        privateKey: SDK_PRIVATE_KEY
    }
    const isChainConnected = await ima.mainnet.isChainConnected(SCHAIN_NAME);
    if (!isChainConnected){
        await ima.connectSchain(SCHAIN_NAME, opts);
    }
}

async function ethTransferDemo(ima) {
    const address = helper.privateKeyToAddress(ima.mainnet.web3, TEST_PRIVATE_KEY);
    let txOpts = {
        value: TEST_WEI_TRANSFER_VALUE,
        address: address,
        privateKey: TEST_PRIVATE_KEY
    };

    let mainnetBalanceBefore = await ima.mainnet.ethBalance(address);
    let sChainBalanceBefore = await ima.schain.ethBalance(address);

    await ima.mainnet.depositETHtoSChain(
        SCHAIN_NAME,
        txOpts
    );
    await ima.schain.waitETHBalanceChange(address, sChainBalanceBefore);

    let mainnetBalanceAfterDeposit = await ima.mainnet.ethBalance(address);
    let sChainBalanceAfterDeposit = await ima.schain.ethBalance(address);

    console.log('M -> S transfer complete!');
    console.log('Mainnet balance before deposit: ', mainnetBalanceBefore);
    console.log('sChain balance before deposit: ', sChainBalanceBefore);
    console.log('Mainnet balance after deposit: ', mainnetBalanceAfterDeposit);
    console.log('sChain balance after deposit: ', sChainBalanceAfterDeposit);

    let lockedETHAmount = await ima.mainnet.lockedETHAmount(address);

    await ima.schain.withdrawETH(
        TEST_WEI_TRANSFER_VALUE,
        {
            address: address,
            privateKey: TEST_PRIVATE_KEY
        }
    );

    await ima.mainnet.waitLockedETHAmountChange(address, lockedETHAmount);
    await ima.mainnet.getMyEth(
        {
            address: address,
            privateKey: TEST_PRIVATE_KEY
        }
    );

    let mainnetBalanceAfterWithdraw = await ima.mainnet.ethBalance(address);
    let sChainBalanceAfterWithdraw = await ima.schain.ethBalance(address);

    console.log('S -> M transfer complete!');
    console.log('Mainnet balance before withdraw: ', mainnetBalanceAfterDeposit);
    console.log('sChain balance before withdraw: ', sChainBalanceAfterDeposit);
    console.log('Mainnet balance after withdraw: ', mainnetBalanceAfterWithdraw);
    console.log('sChain balance after withdraw: ', sChainBalanceAfterWithdraw);
}

async function main() {
    let ima = initIMA();
    const transferValBN = ima.mainnet.web3.utils.toBN(TEST_WEI_TRANSFER_VALUE);

    await chainSetup(ima);
    await reimburseWallet(ima);
    await ethTransferDemo(ima);
}

main();